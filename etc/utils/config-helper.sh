if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
art
ec "CONFIG FILES:"
ec "Examine config files"
ec $PROFILE/config-validator.json
cat $PROFILE/config-validator.json

ec $PROFILE/config-validator-node.json
cat $PROFILE/config-validator-node.json

ec $PROFILE/config-client.json
cat $PROFILE/config-client.json

ec $PROFILE/config-client-localhost.json
cat $PROFILE/config-client-localhost.json

ec $PROFILE/config-global.json
cat $PROFILE/config-global.json
  
ec $TONDB/config.json
cat $TONDB/config.json  


ec "ENV FILE:"
cat $GRAMCORE/.env

ec "Your ip address is $IP ( $IPNUM )"

ec "Scroll back in this pane to see the ENV and config files"

