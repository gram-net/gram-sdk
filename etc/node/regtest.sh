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

if [ "$ARG1" == "" ]; then
  ZEROSTATESCRIPT=${GRAMCORE}/etc/config/gram-testnet-gen-zerostate.fif
else
  ZEROSTATESCRIPT=$(realpath $ARG1)
fi

ec "Configuring regtest node"

source gram configure
source gram validator-keys

mkdir -p $PROFILE/zerostate

ec "MAKE MASTER CONFIG FILE"
cp $GRAMCORE/etc/config/config-global-template.json $PROFILE/config-global.json
sed -i'' -e "s/_DHTNODE_/"${DHTNODE}"/" $PROFILE/config-global.json

ec "BUILD ZERO STATE"
cp $PROFILE/keys/auto_validator.ed25519.pub $PROFILE/zerostate/validator-keys.pub
cd $PROFILE/zerostate
create-state -I$TON/crypto/fift/lib:$TON/crypto/smartcont $ZEROSTATESCRIPT >gen-zerostate.txt
# cat gen-zerostate.txt

base64 -i $PROFILE/zerostate/zerostate.rhash >$PROFILE/zerostate/zerostate.rhash.base64
base64 -i $PROFILE/zerostate/zerostate.fhash >$PROFILE/zerostate/zerostate.fhash.base64

ec "INSERT ZERO STATE HASHES"
RHASH=$(sed -e 's/[\/&]/\\&/g' $PROFILE/zerostate/zerostate.rhash.base64)
FHASH=$(sed -e 's/[\/&]/\\&/g' $PROFILE/zerostate/zerostate.fhash.base64)

sed -i'' -e "s/_RHASH_/"${RHASH}"/" $PROFILE/config-global.json
sed -i'' -e "s/_FHASH_/"${FHASH}"/" $PROFILE/config-global.json
sed -i'' -e "s/_RHASH_/"${RHASH}"/" $PROFILE/config-client.json
sed -i'' -e "s/_FHASH_/"${FHASH}"/" $PROFILE/config-client.json
sed -i'' -e "s/_RHASH_/"${RHASH}"/" $PROFILE/config-client-localhost.json
sed -i'' -e "s/_FHASH_/"${FHASH}"/" $PROFILE/config-client-localhost.json

# cp $PROFILE/config-global.json $GRAMCORE/tmp
# cp $PROFILE/config-client.json $GRAMCORE/tmp

ec "root and file hash copied to config files"

mkdir -p $TONDB/static
sha256sum $PROFILE/zerostate/zerostate.boc | tr '[:lower:]' '[:upper:]' >$PROFILE/zerostate/zerostatesha256
input="${PROFILE}/zerostate/zerostatesha256"
while IFS= read -r line; do
  IFS=' '                       # space is set as delimiter
  read -ra ZEROSTATE <<<"$line" # str is read into an array as tokens separated by IFS
  cp $PROFILE/zerostate/zerostate.boc $TONDB/static/"${ZEROSTATE[0]}"
done <"$input"

sha256sum $PROFILE/zerostate/basestate0.boc | tr '[:lower:]' '[:upper:]' >$PROFILE/zerostate/basestatesha256
input="${PROFILE}/zerostate/basestatesha256"
while IFS= read -r line; do
  IFS=' '                       # space is set as delimiter
  read -ra BASESTATE <<<"$line" # str is read into an array as tokens separated by IFS
  cp $PROFILE/zerostate/basestate0.boc $TONDB/static/"${BASESTATE[0]}"
done <"$input"

# ec "CREATING ZIP FILE OF ZEROSTATE STATIC FILES"
# tar -czvf $PROFILE/static.tar.gz -C $TONDB/static/ .
# stat $PROFILE/static.tar.gz

echo "DONE" >$PROFILE/profile-done

gram config-helper
