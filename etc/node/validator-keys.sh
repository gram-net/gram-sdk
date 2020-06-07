if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
ec "BUILD VALIDATOR KEYS"

base64 -i $PROFILE/keys/auto_validator.id > $PROFILE/keys/auto_validator.id.base64
export VALIDATOR_ID=$(sed -e 's/[\/&]/\\&/g' $PROFILE/keys/auto_validator.id.base64)

sha256sum $PROFILE/keys/auto_validator.pub | tr '[:lower:]' '[:upper:]' > $PROFILE/keys/auto_validator_sha256
input="${PROFILE}/keys/auto_validator_sha256"
while IFS= read -r line
do
  IFS=' ' # space is set as delimiter
  read -ra VALID256 <<< "$line" # str is read into an array as tokens separated by IFS
  cp $PROFILE/keys/auto_validator.pk $TONDB/keyring/"${VALID256[0]}"
  echo "validator public key hash"
  echo "${VALID256[0]}"
done < "$input"
# cat $PROFILE/keys/validator_temp.out
input="${PROFILE}/keys/validator_temp.out"
while IFS= read -r line
do
  IFS=' ' # space is set as delimiter
  read -ra VALIDATORTEMP <<< "$line" # str is read into an array as tokens separated by IFS
  cp $PROFILE/keys/validator_temp $TONDB/keyring/"${VALIDATORTEMP[0]}"
  echo "${VALIDATORTEMP[1]}" > $PROFILE/keys/validator_temp.pub.base64
  echo "validator temp pubkey sha256 and base64"
  echo "${VALIDATORTEMP[0]}"
  cat $PROFILE/keys/validator_temp.pub.base64
done < "$input"
export VALIDATOR_TEMP=$(sed -e 's/[\/&]/\\&/g' $PROFILE/keys/validator_temp.pub.base64)

# cat $PROFILE/keys/validator_adnl.out
input="${PROFILE}/keys/validator_adnl.out"
while IFS= read -r line
do
  IFS=' ' # space is set as delimiter
  read -ra VALIDATORADNLSPLIT <<< "$line" # str is read into an array as tokens separated by IFS

  cp $PROFILE/keys/validator_adnl $TONDB/keyring/"${VALIDATORADNLSPLIT[0]}"
  echo "${VALIDATORADNLSPLIT[1]}" > $PROFILE/keys/validator_adnl.pub.base64
  echo "validator adnl pubkey hash and base64"
  echo "${VALIDATORADNLSPLIT[0]}"
  cat $PROFILE/keys/validator_adnl.pub.base64
done < "$input"
export VALIDATORADNL=$(sed -e 's/[\/&]/\\&/g' $PROFILE/keys/validator_adnl.pub.base64)

# VALIDATOR_REG="
# export TEMP=\"${VALIDATORTEMP[0]}\"
# export ADNL=\"${VALIDATORADNLSPLIT[0]}\"
# export PUB=\"${VALID256[0]}\"
# "
# echo $VALIDATOR_REG > $PROFILE/validator-reg.sh
# chmod +x $PROFILE/validator-reg.sh

# cat $PROFILE/validator-reg.sh

# export ELECTIONDATE=0
export CURRDATE=$(date +%s)
export EXPIRE=$(($CURRDATE+100010))
# echo $EXPIRE
# echo $ELECTIONDATE

# sed -i'' -e "s/_ELECTIONDATE_/"${ELECTIONDATE}"/" $PROFILE/config-validator.json

sed -i'' -e "s/_EXPIRE_/"${EXPIRE}"/" $PROFILE/config-validator.json

sed -i'' -e "s/_VALIDATOR_ID_/"${VALIDATOR_ID}"/" $PROFILE/config-validator.json
sed -i'' -e "s/_VALIDATORADNL_/"${VALIDATORADNL}"/" $PROFILE/config-validator.json
sed -i'' -e "s/_VALIDATOR_TEMP_/"${VALIDATOR_ID}"/" $PROFILE/config-validator.json

cp $PROFILE/config-validator.json $TONDB/config.json

ec "node is now set up with default configuration file, and your validator keys have been created"