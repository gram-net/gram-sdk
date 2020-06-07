if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
ec $GLOBALCONFIG
if [ "$GLOBALCONFIG" == "" ]
then
  ec "---"
  ec "ERROR: Specify GLOBALCONFIG ENV variable with path to global config.json like http://localhost:8084/config-global.json"
  ec "---"
  exit 2
fi

ec "GET MASTER CONFIG:"
echo  $GLOBALCONFIG
curl -o $PROFILE/config-global.json "${GLOBALCONFIG}"
ec $PROFILE/config-global.json
cat $PROFILE/config-global.json

# cp $PROFILE/config-global.json $GRAMCORE/tmp