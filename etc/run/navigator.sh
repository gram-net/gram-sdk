if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi
if [ "$DEPLOYTYPE" == "metal" ]; then
  NAV_PATH=navigator/src-cordova/www
else
  NAV_PATH=navigator
fi
http-server -r --cors -c-1 -p $NAV_PORT $GRAMCORE/$NAV_PATH
