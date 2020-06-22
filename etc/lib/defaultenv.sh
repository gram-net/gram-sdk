if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi

export GRAM_IP=localhost
export TON_ENGINE_PORT=6302
export TON_OUTGOING=3278
export LITESERVER_PORT=6304
export JSON_EXPLORER_PORT=8082
export CONSOLE_PORT=6303
export GRAM_API_PORT=8084
export DOCS_PORT=8090
export WEB_EXPLORER_PORT=8083
export NAV_PORT=8088
export TON_LOGLEVEL=2
export VIZ_PORT=8089
export NODE_OPTIONS="--max_old_space_size=8192"
# these are automatically set inside the docker containers
# use these settings for bare metal dev
export DOTENV_CONFIG_PATH=$GRAMCORE/.env
export TON_SMARTCONT=$GRAMCORE/lib/smartcont
export LIBFIFT=$GRAMCORE/lib/fift
export FIFTPATH=$LIBFIFT:$TON_SMARTCONT
export LS_PUB=$GRAMCORE/profile/keys/liteserver.pub
export PROFILE=$GRAMCORE/profile
# these are going to be switched up by env.sh
export NODE_ENV=development
export RUNVALIDATOR=1
export RUNNAVIGATOR=1
export RUNAPI=1
export NODETYPE=validator
export DEPLOYTYPE=compose
export GLOBALCONFIG="https://raw.githubusercontent.com/tonlabs/net.ton.dev/master/configs/ton-global.config.json"
export IMAGEURI="registry.gitlab.com/gram-net/gram-sdk:latest"
export JSON_EXPLORER_URI="http://localhost"
export GRAM_API_URI="http://localhost"
export KEYS_DIR=$GRAMCORE/profile/keys
