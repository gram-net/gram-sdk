if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
pm2 stop gram || : 
pm2 flush
pm2 startOrGracefulReload --update-env $ETC/pm2/docs.json
if [ -n "$RUNVALIDATOR" ]; then
  pm2 startOrGracefulReload --update-env $ETC/pm2/validator-engine.json
fi
if [ -n "$RUNAPI" ]; then
  pm2 startOrGracefulReload --update-env ${ETC}/pm2/api.json
fi
if [ -n "$RUNNAVIGATOR" ]; then
  pm2 startOrGracefulReload --update-env ${ETC}/pm2/navigator.json
fi
if [ "$ARG1" == "wait" ]; then
  while true; do :; done & kill -STOP $! && wait $!
fi