if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
ec "GRAM Smart Contract Dev Kit CLI Command Reference"

echo "helpdev: prints a list of available commands"

ec "Binaries:"
echo "fift/func: you can run these commands normally"

echo "This command is TODO..."