if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi
ec "GRAM CLI Command Reference"

ec "Tools (not designed to be called directly)"
echo "launch: launch bare metal GRAM based on the current configuration, usually called by 'gram deploy'"
echo "pm2 <args>: Designed for use inside docker containers"
echo "download-config: download the current environment's global config file to \$PROFILE"
echo "node/[validator|slave|regtest]: configure a certain type of node based on the existing environment"
echo "validator-keys: create keys specifically for a validator"
echo "configure: build the basic node configuration to \$PROFILE"
echo "[linux|osx]: Install build dependencies"
echo "nodejs: Install nodejs dependencies"
echo "deploystack [Force|Incremental|Shutdown|Clean] \$COMPOSE_YML \$PASSWORD: start, shut down, or updates a docker swarm"
echo "subst.py: Used by env script to create a docker-compose file from docker-compose-template.yml"
echo "wait-for-it: Utility to wait for a command to be successful before running another command"
echo "init: run initial install tasks"
echo "validator [reset]? [nostart]?: launch the validator-engine and optionally erases the blockchain data"
echo "json-exp|lite-client|web-exp|validator|console: run various services"

ec "Commands for developers (usually not called directly)"
echo "env: configure your environment (usually called by 'gram deploy')"
echo "log/docker: Outputs docker service logs"
echo "log/[validator|api|navigator]: tails logs of individual services"
echo "navigator: launch Navigator local http server"
echo "mux wasm: launch wasm test environment"
echo "api: launch the GRAM API in development mode"
echo "config-helper: outputs the entire validator configuration JSON"
echo "copy-binaries [linux|osx]: copy TON binaries to bin/[linux|osx]"

ec "Node and Docker Build Tools"
echo "compile [release|release_fresh]: compiles the TON validator-engine"
echo "image [test|release|ubuntu_20|etc...] [--no-cache]?: Builds Docker images. Run with no arguments to see options"

ec "Standard Commands"
echo "deploy [path/to/custom-zerostate.fif]?: Configures and starts a TON node and GRAM Navigator"
echo "mux: launch GRAM service logger (commonly used right after 'gram deploy'"
echo "mux dev: launch smart contract dev shell"
echo "help: prints this list of commands"
echo "helpdev: List TApp Developer Commands"
