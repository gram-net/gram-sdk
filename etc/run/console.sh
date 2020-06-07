if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi

runcmd "validator-engine-console -k $PROFILE/keys/client -p $PROFILE/keys/server.pub -a ${GRAM_IP}:${TON_CONSOLE_PORT} $ARG1"