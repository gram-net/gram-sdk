if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi
art

if [ -n "$LINUX" ]; then
  sudo gram linux
fi

if [ -n "$OSX" ]; then
  gram osx
fi

source $GRAMCORE/bin/gram nodejs

source $GRAMCORE/bin/gram rust

ec "GRAM has been installed. Exit your login shell and reconnect, then run 'gram deploy' or 'gram help'"
