if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
ec "Docs served at http://${GRAM_IP}:${DOCS_PORT}"
http-server -r --cors -c-1 -p $DOCS_PORT $GRAMCORE/docs

