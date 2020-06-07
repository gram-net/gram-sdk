if [ "$ARG1" == "osx" ]; then
  BINPATH=osx
elif [ "$ARG1" == "linux_x64" ]; then
  BINPATH=linux_x64
else
  fail "deploy binaries" "$ARG1 platform invalid"
fi
TONBUILD=$GRAMCORE/build/ton
cp -r $GRAMCORE/ton/crypto/fift/lib $GRAMCORE/lib/fift/
cp -r $GRAMCORE/ton/crypto/smartcont $GRAMCORE/lib/
# cp -r $GRAMCORE/lib/smartcont/auto/*.fif $GRAMCORE/lib/smartcont/
cp $TONBUILD/validator-engine/validator-engine $GRAMCORE/bin/$BINPATH/validator-engine
cp $TONBUILD/validator-engine-console/validator-engine-console $GRAMCORE/bin/$BINPATH/validator-engine-console
cp $TONBUILD/lite-client/lite-client $GRAMCORE/bin/$BINPATH/lite-client
cp $TONBUILD/crypto/fift $GRAMCORE/bin/$BINPATH/fift
cp $TONBUILD/crypto/func $GRAMCORE/bin/$BINPATH/func
cp $TONBUILD/json-explorer/json-explorer $GRAMCORE/bin/$BINPATH/json-explorer
cp $TONBUILD/blockchain-explorer/blockchain-explorer $GRAMCORE/bin/$BINPATH/blockchain-explorer
cp $TONBUILD/rldp-http-proxy/rldp-http-proxy $GRAMCORE/bin/$BINPATH/rldp-http-proxy
cp $TONBUILD/utils/generate-random-id $GRAMCORE/bin/$BINPATH/generate-random-id
cp $TONBUILD/utils/generate-initial-keys $GRAMCORE/bin/$BINPATH/generate-initial-keys
cp $TONBUILD/crypto/create-state $GRAMCORE/bin/$BINPATH/create-state
