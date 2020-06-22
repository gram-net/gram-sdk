if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi
FILE=$PROFILE/profile-done
if test -f "$FILE"; then
  echo "Error: configuration profile exists. Run 'gram deploy' to reconfigure"
  exit 1
fi
ec "Configuring validator node"
source gram configure
source gram download-config
source gram validator-keys
gram config-helper
echo "DONE" >$PROFILE/profile-done
