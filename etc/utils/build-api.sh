if ! [ $GRAMCLI ]; then
  echo "Run scripts using 'gram \$command'"
  exit 1
fi
art
cd $GRAMCORE/api
nvm use
yarn
yarn build
