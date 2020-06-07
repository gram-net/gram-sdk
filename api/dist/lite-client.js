/** @format */
import { join } from 'path';
import { promises as fsp } from 'fs';
import { spawn } from 'child_process';
import nacl from 'tweetnacl';
export class LiteClientError extends Error {
    constructor(client, msg) {
        super(`\n  command: ${client.command}\n  msg: ${msg}`);
    }
}
export class SpawnCommand {
    constructor(command) {
        if (command instanceof SpawnCommand) {
            this.program = command.program;
            this.args = command.args;
            Object.assign(this, command);
        }
        else {
            const split = command.split(/\s+/);
            this.program = split.shift();
            this.args = split;
        }
    }
    toString() {
        return `${this.program} ${this.args.join(' ')}`;
    }
}
export class LiteClient {
    constructor(command, maxQueryTime = 3000) {
        this.idle = [];
        this.command = new SpawnCommand(command || this.defaultCommand);
        this.maxQueryTime = maxQueryTime;
        console.log('' + this.command);
    }
    createWorker() {
        return new Promise((resolve, reject) => {
            let log = '';
            const abortTimeout = setTimeout(() => {
                cp.kill();
                reject(new LiteClientError(this, `worker init took too long\nlog:\n${log}`));
            }, this.maxQueryTime);
            const { command } = this;
            const cp = spawn(command.program, command.args);
            const { stdout, stderr } = cp;
            const ondata = (chunk) => {
                chunk += '';
                log += chunk;
                // eslint-disable-next-line
                const match = chunk.match(/\[([^\[]*Error[^\]]*)\]/);
                if (match) {
                    cp.kill();
                    return reject(new LiteClientError(this, chunk));
                }
                const match2 = chunk.match(/latest masterchain block known to server is/);
                if (match2) {
                    stdout.off('data', ondata);
                    stderr.off('data', ondata);
                    clearTimeout(abortTimeout);
                    resolve(cp);
                }
            };
            stdout.on('data', ondata);
            stderr.on('data', ondata);
        });
    }
    last() {
        return this.query('last', (ctx, resolve, reject) => {
            const match = ctx.match(/latest masterchain block known to server is (\(.*\))/);
            if (match)
                resolve(match[1]);
        });
    }
    async sendfile(content) {
        const fn = join(process.env.PROFILE, 't' + Buffer.from(nacl.randomBytes(32)).toString('base64').replace(/\//g, '-'));
        await fsp.writeFile(fn, content);
        await this.query('sendfile ' + fn, (ctx, resolve, reject) => {
            if (ctx.match(/external message status is 1/))
                resolve();
        });
        await fsp.unlink(fn);
    }
    async runmethod(address, method) {
        return await this.query(`runmethod ${address} ${method}`, (ctx, resolve, reject) => {
            const match = ctx.match(/arguments:\s*\[([^\]]*)\]\s*result:\s*\[([^\]]*)\]/);
            if (match)
                resolve([match[1].trim(), match[2].trim()]);
        });
    }
    async getaccount(address) {
        return await this.query(`getaccount ${address}`, (ctx, resolve, reject) => {
            if (ctx.match(/account state is/)) {
                resolve(ctx);
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async query(q, handle) {
        // console.log({q})
        if (q !== 'last')
            await this.last();
        const w = this.idle.length
            ? this.idle.pop()
            : await this.createWorker();
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line
            const client = this;
            const log = [];
            function ondata(ctx) {
                ctx += '';
                log.push(ctx);
                // eslint-disable-next-line
                const match = ctx.match(/\[([^\[]*Error[^\]]*)\]/);
                if (match)
                    reject(new LiteClientError(client, `error during query => ${q}\nerror: ${match[1]}\n`));
                handle(ctx, hresolve, hreject);
            }
            const abortTimeout = setTimeout(() => {
                reject(new LiteClientError(this, `query took too long => ${q}\nlog:\n${log.join('\nCHUNK:\n')}\n`));
            }, this.maxQueryTime);
            const release = () => {
                clearTimeout(abortTimeout);
                w.stdout.off('data', ondata);
                w.stderr.off('data', ondata);
                this.idle.push(w);
            };
            const hresolve = (...args) => {
                release();
                resolve(...args);
            };
            const hreject = (...args) => {
                release();
                reject(...args);
            };
            w.stdout.on('data', ondata);
            w.stderr.on('data', ondata);
            w.stdin.write(q + '\n');
        });
    }
    dispose() {
        for (const w of this.idle)
            w.kill();
    }
    get defaultCommand() {
        return `lite-client -a ${process.env.GRAM_IP}:${process.env.LITESERVER_PORT} -p ${process.env.LS_PUB}`;
    }
}
//# sourceMappingURL=lite-client.js.map