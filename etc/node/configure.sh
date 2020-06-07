if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
ec "INITIALIZE FILES AND DATA"

mkdir -p $PROFILE
mkdir -p $PROFILE/keys
mkdir -p $TONDB/static
mkdir -p $TONDB/keyring

export BUILDDIR=$GRAMCORE/build/ton

cd $PROFILE
generate-initial-keys -i ${IP}:${TON_ENGINE_PORT}
cd ..
cat ${PROFILE}/auto_remote_ip
export IPNUM=$(cat ${PROFILE}/auto_remote_ip)

ls $PROFILE/keys

generate-random-id -m keys -n $PROFILE/keys/validator_temp > $PROFILE/keys/validator_temp.out
generate-random-id -m keys -n $PROFILE/keys/validator_adnl > $PROFILE/keys/validator_adnl.out
generate-random-id -m keys -n $PROFILE/keys/client > $PROFILE/keys/client.out
generate-random-id -m keys -n $PROFILE/keys/liteserver > $PROFILE/keys/liteserver.out
generate-random-id -m keys -n $PROFILE/keys/server > $PROFILE/keys/server.out

cp $GRAMCORE/etc/config/config-validator-template.json $PROFILE/config-validator.json
cp $GRAMCORE/etc/config/config-validator-node-template.json $PROFILE/config-validator-node.json
cp $GRAMCORE/etc/config/config-client-template.json $PROFILE/config-client.json
cp $GRAMCORE/etc/config/config-client-template.json $PROFILE/config-client-localhost.json

sed -i'' -e "s/_IP_/"${IPNUM}"/" $PROFILE/config-validator.json
sed -i'' -e "s/_TON_ENGINE_PORT_/"${TON_ENGINE_PORT}"/" $PROFILE/config-validator.json
sed -i'' -e "s/_TON_OUTGOING_/"${TON_OUTGOING}"/" $PROFILE/config-validator.json

sed -i'' -e "s/_IP_/"${IPNUM}"/" $PROFILE/config-validator-node.json
sed -i'' -e "s/_TON_ENGINE_PORT_/"${TON_ENGINE_PORT}"/" $PROFILE/config-validator-node.json
sed -i'' -e "s/_TON_OUTGOING_/"${TON_OUTGOING}"/" $PROFILE/config-validator-node.json

sed -i'' -e "s/_IP_/"${IPNUM}"/" $PROFILE/config-client.json
sed -i'' -e "s/_LITESERVER_PORT_/"${LITESERVER_PORT}"/" $PROFILE/config-client.json

sed -i'' -e "s/_LITESERVER_PORT_/"${LITESERVER_PORT}"/" $PROFILE/config-client-localhost.json
sed -i'' -e "s/_IP_/2130706433/" $PROFILE/config-client-localhost.json

ec "DERIVE CONSOLE AND LITESERVER KEYS"

input="${PROFILE}/keys/server.out"
while IFS= read -r line
do
  IFS=' ' # space is set as delimiter
  read -ra SERVER <<< "$line" # str is read into an array as tokens separated by IFS
  cp $PROFILE/keys/server $TONDB/keyring/"${SERVER[0]}"
  # ec "server base64 for config json control[0].id : "
  # echo "server public key hash: ${SERVER[0]}"
  echo "${SERVER[1]}" > $PROFILE/keys/server.pub.base64
done < "$input"
export SERVER=$(sed -e 's/[\/&]/\\&/g' $PROFILE/keys/server.pub.base64)

input="${PROFILE}/keys/client.out"
while IFS= read -r line
do
  IFS=' ' # space is set as delimiter
  read -ra CLIENT <<< "$line" # str is read into an array as tokens separated by IFS
  # ec "client base64 for config json control[0].allowed[0].id: "
  # echo "client public key hash: ${CLIENT[0]}"
  echo "${CLIENT[1]}" > $PROFILE/keys/client.pub.base64
done < "$input"
export CLIENT=$(sed -e 's/[\/&]/\\&/g' $PROFILE/keys/client.pub.base64)

input="${PROFILE}/keys/liteserver.out"
while IFS= read -r line
do
  IFS=' ' # space is set as delimiter
  read -ra LITESERVER <<< "$line" # str is read into an array as tokens separated by IFS
  cp $PROFILE/keys/liteserver $TONDB/keyring/"${LITESERVER[0]}"
  # echo "liteserver public key hash: ${LITESERVER[0]}"
  echo "${LITESERVER[1]}" > $PROFILE/keys/liteserver.pub.base64
done < "$input"
export LITESERVER=$(sed -e 's/[\/&]/\\&/g' $PROFILE/keys/liteserver.pub.base64)

keyring() {
  sha256sum $PROFILE/${1}.pub | tr '[:lower:]' '[:upper:]' > $PROFILE/${1}_sha256
  input="${PROFILE}/${1}_sha256"
  while IFS= read -r line
  do
    IFS=' ' # space is set as delimiter
    read -ra VALID256 <<< "$line" # str is read into an array as tokens separated by IFS
    cp $PROFILE/${1}.pk $TONDB/keyring/"${VALID256[0]}"
    echo "${1} public key hash"
    echo "${VALID256[0]}"
  done < "$input"
}

keyring keys/auto_dht
keyring keys/auto_adnl

ADDRLISTJSON="{\"@type\":\"adnl.addressList\",\"addrs\":[{\"@type\":\"adnl.address.udp\",\"ip\":${IPNUM},\"port\":${TON_ENGINE_PORT}}]}"
ec $ADDRLISTJSON
generate-random-id -k $PROFILE/keys/auto_dht.pk -m dht -a "${ADDRLISTJSON}" > $PROFILE/dht-node 

DHTNODE=$(sed -e 's/[\/&]/\\&/g' $PROFILE/dht-node)

# this is not a thing
# [[ $DHTNODE =~ \"key\":\"([A-Za-z0-9\+\/=]*)\" ]] && DHTNODEID=${BASH_REMATCH[1]}
# sed -i'' -e "s/_DHTNODEID_/"${DHTNODEID}"/" $PROFILE/config-validator.json
# sed -i'' -e "s/_DHTNODEID_/"${DHTNODEID}"/" $PROFILE/config-validator-node.json


ec "FILL CONFIGURATION VALUES"
#
base64 -i $PROFILE/keys/auto_dht.id > $PROFILE/keys/auto_dht.id.base64
export DHT=$(sed -e 's/[\/&]/\\&/g' $PROFILE/keys/auto_dht.id.base64)
sed -i'' -e "s/_DHT_/"${DHT}"/" $PROFILE/config-validator.json
sed -i'' -e "s/_DHT_/"${DHT}"/" $PROFILE/config-validator-node.json

base64 -i $PROFILE/keys/auto_adnl.id > $PROFILE/keys/auto_adnl.id.base64
export ADNL=$(sed -e 's/[\/&]/\\&/g' $PROFILE/keys/auto_adnl.id.base64)
sed -i'' -e "s/_ADNL_/"${ADNL}"/" $PROFILE/config-validator.json
sed -i'' -e "s/_ADNL_/"${ADNL}"/" $PROFILE/config-validator-node.json

sed -i'' -e "s/_SERVER_/"${SERVER}"/" $PROFILE/config-validator.json
sed -i'' -e "s/_CLIENT_/"${CLIENT}"/" $PROFILE/config-validator.json
sed -i'' -e "s/_LITESERVER_/"${LITESERVER}"/" $PROFILE/config-validator.json

sed -i'' -e "s/_SERVER_/"${SERVER}"/" $PROFILE/config-validator-node.json
sed -i'' -e "s/_CLIENT_/"${CLIENT}"/" $PROFILE/config-validator-node.json
sed -i'' -e "s/_LITESERVER_/"${LITESERVER}"/" $PROFILE/config-validator-node.json

sed -i'' -e "s/_LITESERVER_/"${LITESERVER}"/" $PROFILE/config-client.json
sed -i'' -e "s/_LITESERVER_/"${LITESERVER}"/" $PROFILE/config-client-localhost.json

cp $PROFILE/config-validator-node.json $TONDB/config.json