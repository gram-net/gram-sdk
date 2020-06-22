if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi

if ! [ -e $GRAMCORE/.env ]; then
  source $ETC/lib/defaultenv.sh
fi
# DELETE OLD FILE
rm -f $GRAMCORE/.env >/dev/null 2>&1

IP=$ENVIP

until [ "$(echo "${IP}" | grep "\." -o | wc -l)" -eq 3 ] || [ "$COUNT" == "10" ]; do
  if [ -n "$ENVIP" ]; then
    ec "The IP Address you manually entered is invalid. Try again or omit ENVIP= in front of the gram env command to fetch IP automatically"
    exit 1
  fi
  set +e
  COUNT=$(($COUNT + 1))
  echo "GET IP: TRY ${COUNT}"
  IP="$(curl -sS http://ifconfig.me/ip)"
  set -e
done
if ! [ "$(echo "${IP}" | grep "\." -o | wc -l)" -eq 3 ]; then
  ec "Unable to fetch IP Address. You may run this command like: 'ENVIP=YOURPUBLICIPADDRESS gram env', or type your IP address and press enter"
  read IP
  if ! [ "$(echo "${IP}" | grep "\." -o | wc -l)" -eq 3 ]; then
    ec "Cannot get IP address, aborting."
    exit 1
  fi
fi

NEW_DEPLOYTYPE=
while [ "$NEW_DEPLOYTYPE" != "swarm" ] && [ "$NEW_DEPLOYTYPE" != "compose" ] && [ "$NEW_DEPLOYTYPE" != "metal" ]; do
  ecprompt "deployment type: swarm|compose|metal ( ${DEPLOYTYPE} )"
  read NEW_DEPLOYTYPE
  if ! [ -n "$NEW_DEPLOYTYPE" ] && [ -n "$DEPLOYTYPE" ]; then NEW_DEPLOYTYPE=$DEPLOYTYPE; fi
done
DEPLOYTYPE=$NEW_DEPLOYTYPE

NEW_NODETYPE=
while [ "$NEW_NODETYPE" != "validator" ] && [ "$NEW_NODETYPE" != "regtest" ] && [ "$NEW_NODETYPE" != "slave" ]; do
  ecprompt "node type: validator|regtest|slave ( ${NODETYPE} )"
  read NEW_NODETYPE
  if ! [ -n "$NEW_NODETYPE" ]; then NEW_NODETYPE=$NODETYPE; fi
done
NODETYPE=$NEW_NODETYPE

if [ "$DEPLOYTYPE" == "metal" ]; then
  IMAGEURI=
elif [ "$DEPLOYTYPE" == "compose" ] || [ "$DEPLOTYPE" == "swarm" ]; then
  ec "docker containers must use NODE_ENV=production"
  NODE_ENV=production

  if ! [ -n "$IMAGEURI" ]; then IMAGEURI="registry.gitlab.com/gram-net/gram-sdk:latest"; fi
  NEW_IMAGEURI=
  while [ "$NEW_IMAGEURI" == "" ]; do
    ecprompt "docker image: ( ${IMAGEURI} )"
    read NEW_IMAGEURI
    if ! [ -n "$NEW_IMAGEURI" ] && [ -n $IMAGEURI ]; then NEW_IMAGEURI=$IMAGEURI; fi
  done
  IMAGEURI=$NEW_IMAGEURI
else
  fail "ENV config" "invalid DEPLOYTYPE"
fi

if [ "$NODETYPE" == "regtest" ]; then
  GLOBALCONFIG=
else
  if ! [ -n "$GLOBALCONFIG" ]; then GLOBALCONFIG="https://raw.githubusercontent.com/tonlabs/main.ton.dev/master/configs/ton-global.config.json"; fi
  NEW_GLOBALCONFIG=
  while [ "$NEW_GLOBALCONFIG" == "" ]; do
    ecprompt "HTTP path to global config file: ( ${GLOBALCONFIG} )"
    read NEW_GLOBALCONFIG
    if ! [ -n "$NEW_GLOBALCONFIG" ] && [ -n $GLOBALCONFIG ]; then NEW_GLOBALCONFIG=$GLOBALCONFIG; fi
  done
  GLOBALCONFIG=$NEW_GLOBALCONFIG
fi

# CREATE NEW
echo "TON_ENGINE_PORT=${TON_ENGINE_PORT}" >>$GRAMCORE/.env
echo "TON_OUTGOING=${TON_OUTGOING}" >>$GRAMCORE/.env
echo "LITESERVER_PORT=${LITESERVER_PORT}" >>$GRAMCORE/.env
echo "JSON_EXPLORER_PORT=${JSON_EXPLORER_PORT}" >>$GRAMCORE/.env
echo "NAV_PORT=${NAV_PORT}" >>$GRAMCORE/.env
echo "CONSOLE_PORT=${CONSOLE_PORT}" >>$GRAMCORE/.env
echo "GRAM_API_PORT=${GRAM_API_PORT}" >>$GRAMCORE/.env
echo "WEB_EXPLORER_PORT=${WEB_EXPLORER_PORT}" >>$GRAMCORE/.env
echo "VIZ_PORT=${VIZ_PORT}" >>$GRAMCORE/.env
echo "DOCS_PORT=${DOCS_PORT}" >>$GRAMCORE/.env
echo "JSON_EXPLORER_URI=${JSON_EXPLORER_URI}" >>$GRAMCORE/.env
echo "GRAM_API_URI=${GRAM_API_URI}" >>$GRAMCORE/.env
echo "TON_LOGLEVEL=${TON_LOGLEVEL}" >>$GRAMCORE/.env
echo "DOTENV_CONFIG_PATH=${DOTENV_CONFIG_PATH}" >>$GRAMCORE/.env
echo "FIFTPATH=${FIFTPATH}" >>$GRAMCORE/.env
echo "LIBFIFT=${LIBFIFT}" >>$GRAMCORE/.env
echo "PROFILE=${PROFILE}" >>$GRAMCORE/.env
echo "TON_SMARTCONT=${TON_SMARTCONT}" >>$GRAMCORE/.env
echo "NODETYPE=${NODETYPE}" >>$GRAMCORE/.env
echo "GLOBALCONFIG=\"${GLOBALCONFIG}"\" >>$GRAMCORE/.env
echo "NODE_OPTIONS=\"${NODE_OPTIONS}\"" >>$GRAMCORE/.env
echo "NODE_ENV=${NODE_ENV}" >>$GRAMCORE/.env
echo "LS_PUB=${LS_PUB}" >>$GRAMCORE/.env
echo "IMAGEURI=\"${IMAGEURI}"\" >>$GRAMCORE/.env
echo "IP=${IP}" >>$GRAMCORE/.env
echo "GRAM_IP=${GRAM_IP}" >>$GRAMCORE/.env
echo "RUNVALIDATOR=${RUNVALIDATOR}" >>$GRAMCORE/.env
echo "RUNAPI=${RUNAPI}" >>$GRAMCORE/.env
echo "RUNNAVIGATOR=${RUNNAVIGATOR}" >>$GRAMCORE/.env
echo "DEPLOYTYPE=${DEPLOYTYPE}" >>$GRAMCORE/.env
echo "HOSTNAME=$(hostname -s)" >>$GRAMCORE/.env
echo "KEYS_DIR=${KEYS_DIR}" >>$GRAMCORE/.env

rm -f $GRAMCORE/api/.env >/dev/null 2>&1
rm -f $GRAMCORE/navigator/.env >/dev/null 2>&1
rm -f $GRAMCORE/wasm/.env >/dev/null 2>&1

ln -s $GRAMCORE/.env $GRAMCORE/api/.env
ln -s $GRAMCORE/.env $GRAMCORE/navigator/.env
ln -s $GRAMCORE/.env $GRAMCORE/wasm/.env

# finish
source $GRAMCORE/.env
ec 'Configuration file:'
cat $GRAMCORE/.env

# make a docker-compose file using the new ENV
rm -f $GRAMCORE/docker-compose.yml # > /dev/null 2>&1
cp $GRAMCORE/dockerfiles/docker-compose-template.yml $GRAMCORE/docker-compose.yml
python2 $ETC/lib/subst.py --props $GRAMCORE/.env --src_path $GRAMCORE/dockerfiles/docker-compose-template.yml --dst_path $GRAMCORE/docker-compose.yml

ec "DONE SETTING UP ENVIRONMENT"
echo ""
