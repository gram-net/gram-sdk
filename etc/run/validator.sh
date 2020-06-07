if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
runcmd "validator-engine -v${TON_LOGLEVEL} -c ${PROFILE}/config-validator.json -C ${PROFILE}/config-global.json --db ${TONDB} --ip 0.0.0.0:${TON_ENGINE_PORT}"

