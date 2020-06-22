if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi
art
ec "Installing Brew and GRAM Dependencies"

ec "Installing Homebrew"
curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh | bash -

# these linux package names have different names in brew, but they are covered below:
# libghc-zlib-dev libreadline-dev libmicrohttpd-dev  libssl-dev libgflags-dev

# RedHat needs this weird double install for linuxbrew GCC
brew install gcc || :
brew install gcc
brew upgrade gcc

# we break up the installation into individual pieces so we can read potential errors more easily
DEPSLIST="rustup gawk python tmux make cmake ccache vim tcpdump watch wget coreutils lzlib openssl zlib libmicrohttpd gperf gperftools gflags"

IFS=' '                      # space is set as delimiter
read -ra TARG <<<"$DEPSLIST" # str is read into an array as tokens separated by IFS
for i in "${TARG[@]}"; do    # access each element of array
  brew install $i || :
  brew upgrade $i
done

ec "Done installing dependencies with brew"

GRAMBINPATH=osx
ec "Linking pre-built OSX binaries"
rm -f /usr/local/bin/validator-engine || :
rm -f /usr/local/bin/validator-engine-console || :
rm -f /usr/local/bin/lite-client || :
rm -f /usr/local/bin/fift || :
rm -f /usr/local/bin/func || :
rm -f /usr/local/bin/json-explorer || :
rm -f /usr/local/bin/blockchain-explorer || :
rm -f /usr/local/bin/rldp-http-proxy || :
rm -f /usr/local/bin/generate-initial-keys || :
rm -f /usr/local/bin/generate-random-id || :
rm -f /usr/local/bin/create-state || :
ln -s $GRAMCORE/bin/$GRAMBINPATH/validator-engine /usr/local/bin/validator-engine
ln -s $GRAMCORE/bin/$GRAMBINPATH/validator-engine-console /usr/local/bin/validator-engine-console
ln -s $GRAMCORE/bin/$GRAMBINPATH/lite-client /usr/local/bin/lite-client
ln -s $GRAMCORE/bin/$GRAMBINPATH/fift /usr/local/bin/fift
ln -s $GRAMCORE/bin/$GRAMBINPATH/func /usr/local/bin/func
ln -s $GRAMCORE/bin/$GRAMBINPATH/json-explorer /usr/local/bin/json-explorer
ln -s $GRAMCORE/bin/$GRAMBINPATH/blockchain-explorer /usr/local/bin/blockchain-explorer
ln -s $GRAMCORE/bin/$GRAMBINPATH/rldp-http-proxy /usr/local/bin/rldp-http-proxy
ln -s $GRAMCORE/bin/$GRAMBINPATH/generate-random-id /usr/local/bin/generate-random-id
ln -s $GRAMCORE/bin/$GRAMBINPATH/generate-initial-keys /usr/local/bin/generate-initial-keys
ln -s $GRAMCORE/bin/$GRAMBINPATH/create-state /usr/local/bin/create-state
