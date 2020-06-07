if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
if [ "$ARG1" != "" ]; then
  pm2 $ARG1 $ARG2 $ARG3 $ARG4 $ARG5 $ARG6
else
  watch -n 15 'pm2 ls'
fi