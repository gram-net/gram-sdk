if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi


# DATE='runmethod -1:3333333333333333333333333333333333333333333333333333333333333333 active_election_id'
# export ELECTIONDATE=0
# export CURRDATE=$(date +%s)
# export EXPIRE=$(($CURRDATE+100000))

# new-wallet.fif -1 auto_validator_ed25519
# validator-elect-req.fif @auto_validator_ed25519.addr $ELECTIONDATE 2.7 $ADNL > validator_sign_string
# testgiver.fif @auto_validator_ed25519.addr 0 100 > /dev/null 2>&1

# PUB64=validator pub64
# VALIDATOR_SIGNATURE="sign ${PUB} ${myarray[1]}"
 
# validator-elect-signed.fif @auto_validator_ed25519.addr ${DATE} 2.7 ${ADNL} ${PUB64} ${VALIDATOR_SIGNATURE}
# validator-elect-signed.fif @auto_validator_ed25519.addr $ELECTIONDATE 2.7 $ADNL $PUB64 $VALIDATOR_SIGNATURE > /dev/null 2>&1
# wallet.fif auto_validator_ed25519 -1:3333333333333333333333333333333333333333333333333333333333333333 0 2.5 -B validator-query.boc validator-send > /dev/null 2>&1

# 'runmethod -1:3333333333333333333333333333333333333333333333333333333333333333 participant_list'
