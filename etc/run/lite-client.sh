if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi

runcmd "lite-client -p ${LS_PUB} -a ${GRAM_IP}:${LITESERVER_PORT} $ARG1"