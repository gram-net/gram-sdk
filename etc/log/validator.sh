if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
ART=log
art

ec "Validator log"
pm2 log validator-engine