/** @format */
/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from 'child_process';
export declare class LiteClientError extends Error {
    constructor(client: LiteClient, msg: string);
}
export declare class SpawnCommand {
    readonly program: string;
    readonly args: string[];
    constructor(command: SpawnCommand | string);
    toString(): string;
}
export declare class LiteClient {
    maxQueryTime: number;
    command: SpawnCommand;
    idle: ChildProcessWithoutNullStreams[];
    constructor(command?: SpawnCommand | string, maxQueryTime?: number);
    createWorker(): Promise<ChildProcessWithoutNullStreams>;
    last(): Promise<unknown>;
    sendfile(content: Uint8Array): Promise<void>;
    runmethod(address: string, method: string): Promise<string[]>;
    getaccount(address: string): Promise<string>;
    query(q: string, handle: any): Promise<unknown>;
    dispose(): void;
    get defaultCommand(): string;
}
//# sourceMappingURL=lite-client.d.ts.map