if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi
# set -x
DEBUG="yes"
STAKE="${1:-100000}"

"lite-client" \
  -p "${LS_PUB}" \
  -a "${GRAM_IP}:${LITESERVER_PORT}" \
  -rc "getconfig 1" -rc "quit" \
  &>"${KEYS_DIR}/elector-addr"

awk -v KEYS_DIR="${KEYS_DIR}" -v GRAMCORE="${GRAMCORE}" -v LS_PUB="${LS_PUB}" -v GRAM_IP="${GRAM_IP}" -v LITESERVER_PORT="${LITESERVER_PORT}" '{
    if (substr($1, length($1)-13) == "ConfigParam(1)") {
        printf "lite-client ";
        printf "-p " LS_PUB " -a " GRAM_IP ":" LITESERVER_PORT;
        printf " -rc \"runmethod -1:" substr($4, 15, 64) " ";
        print  "active_election_id\" -rc \"quit\" &> " KEYS_DIR "/elector-state"
        printf "lite-client ";
        printf "-p " LS_PUB " -a " GRAM_IP ":" LITESERVER_PORT;
        printf " -rc \"runmethod -1:" substr($4, 15, 64) " ";
        print  "election_data\" -rc \"getconfig -32\" -rc \"quit\" &> " KEYS_DIR "/election-data"
        printf GRAMCORE "/etc/utils/convert_address -1:" substr($4, 15, 64) " base64 -b > "
        print  KEYS_DIR "/elector-addr-base64"
    }
}' "${KEYS_DIR}/elector-addr" >"${KEYS_DIR}/elector-run"

if [ "$DEBUG" = "yes" ]; then
  echo "${KEYS_DIR}/elector-run:"
  cat "${KEYS_DIR}/elector-run"
fi

bash "${KEYS_DIR}/elector-run"

awk '{
    if ($1 == "result:") {
        print $3
    }
}' "${KEYS_DIR}/elector-state" >"${KEYS_DIR}/election-id"

awk '{
    if ($1 == "result:") {
        print $0
    } else if (substr($1, length($1)-15) == "ConfigParam(-32)") {
        print $0
    }
}' "${KEYS_DIR}/election-data"

election_id=$(cat "${KEYS_DIR}/election-id")

if [ "$election_id" == "0" ]; then
  date +"%F %T No current elections"
  awk -v KEYS_DIR="${KEYS_DIR}" -v GRAMCORE="${GRAMCORE}" -v LS_PUB="${LS_PUB}" -v GRAM_IP="${GRAM_IP}" -v LITESERVER_PORT="${LITESERVER_PORT}" '{
        if (($1 == "new") && ($2 == "wallet") && ($3 == "address")) {
            addr = substr($5, 4)
        } else if (substr($1, length($1)-13) == "ConfigParam(1)") {
            printf "lite-client ";
            printf "-p " LS_PUB " -a " GRAM_IP ":" LITESERVER_PORT;
            printf " -rc \"runmethod -1:" substr($4, 15, 64);
            printf " compute_returned_stake 0x" addr "\" ";
            print  " -rc \"quit\" &> " KEYS_DIR "/recover-state"
        }
    }' "${KEYS_DIR}/validator-dump" "${KEYS_DIR}/elector-addr" >"${KEYS_DIR}/recover-run"

  if [ "$DEBUG" = "yes" ]; then
    echo "${KEYS_DIR}/recover-run:"
    cat "${KEYS_DIR}/recover-run"
  fi

  bash "${KEYS_DIR}/recover-run"

  awk '{
        if ($1 == "result:") {
            print $3
        }
    }' "${KEYS_DIR}/recover-state" >"${KEYS_DIR}/recover-amount"

  recover_amount=$(cat "${KEYS_DIR}/recover-amount")

  if [ "$recover_amount" != "0" ]; then
    awk -v KEYS_DIR="${KEYS_DIR}" -v LS_PUB="${LS_PUB}" -v GRAM_IP="${GRAM_IP}" -v LITESERVER_PORT="${LITESERVER_PORT}" '{
            if ($1 == "Bounceable") {
                printf "lite-client ";
                printf "-p " LS_PUB " -a " GRAM_IP ":" LITESERVER_PORT;
                print  " -rc \"getaccount " $6 "\" -rc \"quit\" &> " KEYS_DIR "/recover-state"
            }
        }' "${KEYS_DIR}/validator-dump" >"${KEYS_DIR}/recover-run1"

    bash "${KEYS_DIR}/recover-run1"

    awk -v KEYS_DIR="${KEYS_DIR}" -v LS_PUB="${LS_PUB}" -v GRAM_IP="${GRAM_IP}" -v LITESERVER_PORT="${LITESERVER_PORT}" '{
            if ($1 == "Bounceable") {
                printf "source gram lc runmethod " $6 " seqno;";
                print  "echo $LCRES_FINAL > " KEYS_DIR "/get-seqno"
            }
        }' "${KEYS_DIR}/validator-dump" >"${KEYS_DIR}/get-seqno-run"

    bash "${KEYS_DIR}/get-seqno-run"
    SEQNO=$(cat $KEYS_DIR/get-seqno)

    awk -v SEQNO="${SEQNO}" -v validator="validator" -v KEYS_DIR="${KEYS_DIR}" -v GRAMCORE="${GRAMCORE}" -v LS_PUB="${LS_PUB}" -v GRAM_IP="${GRAM_IP}" -v LITESERVER_PORT="${LITESERVER_PORT}" -v LIBFIFT="${LIBFIFT}" -v TON_SMARTCONT="${TON_SMARTCONT}" '{
            if (NR == 1) {
                elector = $0
            } else if ($1 == "data:(just") {
                idx = NR
            } else if ((idx > 0) && (idx+3 == NR)) {
                seqno = sprintf("%d", "0x" substr($1, 3, 8))
                printf "fift ";
                printf "-I " LIBFIFT ":" TON_SMARTCONT;
                print  " -s recover-stake.fif " KEYS_DIR "/recover-query.boc";
                printf "fift ";
                printf "-I " LIBFIFT ":" TON_SMARTCONT;
                printf " -s wallet.fif " KEYS_DIR "/" validator " " elector " " SEQNO " ";
                print  "1 -B " KEYS_DIR "/recover-query.boc " KEYS_DIR "/recover-wallet-query";
                printf "lite-client ";
                printf "-p " LS_PUB " -a " GRAM_IP ":" LITESERVER_PORT;
                print  " -rc \"sendfile " KEYS_DIR "/recover-wallet-query.boc\" -rc \"quit\""
            }
        }' "${KEYS_DIR}/elector-addr-base64" "${KEYS_DIR}/recover-state" >"${KEYS_DIR}/recover-run2"

    if [ "$DEBUG" = "yes" ]; then
      echo "${KEYS_DIR}/recover-run2:"
      cat "${KEYS_DIR}/recover-run2"
    fi

    bash "${KEYS_DIR}/recover-run2"
    date +"INFO: %F %T Recover of $recover_amount RB requested"
  fi

  exit
fi

awk -v KEYS_DIR="${PROFILE}/keys" -v LS_PUB="${LS_PUB}" -v GRAM_IP="${GRAM_IP}" -v LITESERVER_PORT="${LITESERVER_PORT}" '{
    if ($1 == "Bounceable") {
        printf "lite-client ";
        printf "-p " LS_PUB " -a " GRAM_IP ":" LITESERVER_PORT;
        print  " -rc \"getaccount " $6 "\" -rc \"quit\" &> " KEYS_DIR "/wallet-state"
    }
}' "${KEYS_DIR}/validator-dump" >"${KEYS_DIR}/wallet-state-run"

if [ "$DEBUG" = "yes" ]; then
  echo "${KEYS_DIR}/wallet-state-run:"
  cat "${KEYS_DIR}/wallet-state-run"
fi

bash "${KEYS_DIR}/wallet-state-run"

has_grams=$(awk -v validator="validator" '{
    if ($1 == "amount:(var_uint") {
        balance = substr($3, 7, length($3)-8);
        if (length(balance) >= 14) {
            if (substr(balance, 1, length(balance)-9)+0 >= $stake) {
                printf balance
            }
        }
    }
}' "${KEYS_DIR}/wallet-state")

if [ "$has_grams" = "" ]; then
  echo "INFO: \$has_grams is empty"
  exit
fi

echo "INFO: has_grams = ${has_grams}"

if [ -f "${KEYS_DIR}/stop-election" ]; then
  echo "WARNING: manual stop of participation in elections with ${KEYS_DIR}/stop-election file"
  exit
fi

if [ -f "${KEYS_DIR}/active-election-id" ]; then
  active_election_id=$(cat "${KEYS_DIR}/active-election-id")
  if [ "$active_election_id" == "$election_id" ]; then
    ec "stopping, because election and active election are same"
    exit
  fi
fi

cp "${KEYS_DIR}/election-id" "${KEYS_DIR}/active-election-id"
date +"INFO: %F %T election_id = $election_id"
set -x
"validator-engine-console" \
  -k "${KEYS_DIR}/client" \
  -p "${KEYS_DIR}/server.pub" \
  -a "${GRAM_IP}:${CONSOLE_PORT}" \
  -c "newkey" -c "quit" \
  &>"${KEYS_DIR}/validator-election-key"

"validator-engine-console" \
  -k "${KEYS_DIR}/client" \
  -p "${KEYS_DIR}/server.pub" \
  -a "${GRAM_IP}:${CONSOLE_PORT}" \
  -c "newkey" -c "quit" \
  &>"${KEYS_DIR}/validator-election-adnl-key"

"lite-client" \
  -p "${LS_PUB}" \
  -a "${GRAM_IP}:${LITESERVER_PORT}" \
  -rc "getconfig 15" -rc "quit" \
  &>"${KEYS_DIR}/elector-params"
set +x
awk -v validator="validator" -v KEYS_DIR="${KEYS_DIR}" -v LIBFIFT="${LIBFIFT}" -v TON_SMARTCONT="${TON_SMARTCONT}" -v GRAM_IP="${GRAM_IP}" -v CONSOLE_PORT="${CONSOLE_PORT}" '{
    if (NR == 1) {
        election_start = $1 + 0
    } else if (($1 == "created") && ($2 == "new") && ($3 == "key")) {
        if (length(key) == 0) {
            key = $4
        } else {
            key_adnl = $4
        }
    } else if (substr($1, length($1)-14) == "ConfigParam(15)") {
        time = election_start + 600;
        split($4, t, ":");
        time = time + t[2] + 0;
        split($5, t, ":");
        time = time + t[2] + 0;
        split($6, t, ":");
        time = time + t[2] + 0;
        split($7, t, ":");
        time = time + t[2] + 0;
        election_stop = time;
        printf "validator-engine-console ";
        printf "-k " KEYS_DIR "/client -p " KEYS_DIR "/server.pub -a " GRAM_IP ":" CONSOLE_PORT;
        printf " -c \"addpermkey " key " " election_start " " election_stop "\" ";
        printf "-c \"addtempkey " key " " key " " election_stop "\" ";
        printf "-c \"addadnl " key_adnl " 0\" ";
        printf "-c \"addvalidatoraddr " key " " key_adnl " " election_stop "\" ";
        print  "-c \"quit\"";
        printf "fift ";
        printf "-I " LIBFIFT ":" TON_SMARTCONT;
        printf " -s validator-elect-req.fif @" KEYS_DIR "/" validator ".addr ";
        printf election_start " 2 " key_adnl " " KEYS_DIR "/validator-to-sign.bin ";
        print  "> " KEYS_DIR "/" validator "-request-dump"
    }
}' "${KEYS_DIR}/election-id" "${KEYS_DIR}/validator-election-key" "${KEYS_DIR}/validator-election-adnl-key" "${KEYS_DIR}/elector-params" >"${KEYS_DIR}/elector-run1"

if [ "$DEBUG" = "yes" ]; then
  echo "${KEYS_DIR}/elector-run1:"
  cat "${KEYS_DIR}/elector-run1"
fi

bash "${KEYS_DIR}/elector-run1"

awk -v validator="validator" -v KEYS_DIR="${KEYS_DIR}" -v GRAM_IP="${GRAM_IP}" -v CONSOLE_PORT="${CONSOLE_PORT}" '{
    if (NR == 2) {
        request = $1
    } else if (($1 == "created") && ($2 == "new") && ($3 == "key")) {
        printf "validator-engine-console ";
        printf "-k " KEYS_DIR "/client -p " KEYS_DIR "/server.pub -a " GRAM_IP ":" CONSOLE_PORT;
        printf " -c \"exportpub " $4 "\" ";
        print  "-c \"sign " $4 " " request "\" &> " KEYS_DIR "/" validator "-request-dump1"
   }
}' "${KEYS_DIR}/validator-request-dump" "${KEYS_DIR}/validator-election-key" >"${KEYS_DIR}/elector-run2"

if [ "$DEBUG" = "yes" ]; then
  echo "${KEYS_DIR}/elector-run2:"
  cat "${KEYS_DIR}/elector-run2"
fi

bash "${KEYS_DIR}/elector-run2"

awk -v validator="validator" -v KEYS_DIR="${KEYS_DIR}" -v LIBFIFT="${LIBFIFT}" -v TON_SMARTCONT="${TON_SMARTCONT}" '{
    if (NR == 1) {
        election_start = $1 + 0
    } else if (($1 == "got") && ($2 == "public") && ($3 == "key:")) {
        key = $4
    } else if (($1 == "got") && ($2 == "signature")) {
        signature = $3
    } else if (($1 == "created") && ($2 == "new") && ($3 == "key")) {
        printf "fift ";
        printf "-I " LIBFIFT ":" TON_SMARTCONT;
        printf " -s validator-elect-signed.fif @" KEYS_DIR "/" validator ".addr " election_start " 2 " $4;
        printf " " key " " signature " " KEYS_DIR "/" validator "-query.boc ";
        print  "> " KEYS_DIR "/" validator "-request-dump2"
    }
}' "${KEYS_DIR}/election-id" "${KEYS_DIR}/validator-request-dump1" "${KEYS_DIR}/validator-election-adnl-key" >"${KEYS_DIR}/elector-run3"

if [ "$DEBUG" = "yes" ]; then
  echo "${KEYS_DIR}/elector-run3:"
  cat "${KEYS_DIR}/elector-run3"
fi

bash "${KEYS_DIR}/elector-run3"

awk -v KEYS_DIR="${KEYS_DIR}" -v LS_PUB="${LS_PUB}" -v GRAM_IP="${GRAM_IP}" -v LITESERVER_PORT="${LITESERVER_PORT}" '{
        if ($1 == "Bounceable") {
            printf "source gram lc runmethod " $6 " seqno;";
            print  "echo $LCRES_FINAL > " KEYS_DIR "/get-seqno"
        }
    }' "${KEYS_DIR}/validator-dump" >"${KEYS_DIR}/get-seqno-run"

bash "${KEYS_DIR}/get-seqno-run"
SEQNO=$(cat $KEYS_DIR/get-seqno)

awk -v SEQNO="${SEQNO}" -v validator="validator" -v KEYS_DIR="${KEYS_DIR}" -v LS_PUB="${LS_PUB}" -v LIBFIFT="${LIBFIFT}" -v TON_SMARTCONT="${TON_SMARTCONT}" -v stake="$STAKE" -v GRAM_IP="${GRAM_IP}" -v LITESERVER_PORT="${LITESERVER_PORT}" '{
    if (NR == 1) {
        elector = $0
    } else if ($1 == "data:(just") {
        idx = NR
    } else if ((idx > 0) && (idx+3 == NR)) {
        seqno = sprintf("%d", "0x" substr($1, 3, 8))
        printf "fift ";
        printf "-I " LIBFIFT ":" TON_SMARTCONT;
        printf " -s wallet.fif " KEYS_DIR "/" validator " " elector " " SEQNO " ";
        printf stake ". -B " KEYS_DIR "/" validator "-query.boc " KEYS_DIR "/" validator "-wallet-query ";
        print  "> " KEYS_DIR "/" validator "-query-dump";
        printf "lite-client ";
        printf "-p " LS_PUB " -a " GRAM_IP ":" LITESERVER_PORT;
        printf " -rc \"sendfile " KEYS_DIR "/" validator "-wallet-query.boc\" ";
        print  " -rc \"quit\""
    }
}' "${KEYS_DIR}/elector-addr-base64" "${KEYS_DIR}/wallet-state" >"${KEYS_DIR}/elector-run4"

if [ "$DEBUG" = "yes" ]; then
  echo "${KEYS_DIR}/elector-run4:"
  cat "${KEYS_DIR}/elector-run4"
fi

bash "${KEYS_DIR}/elector-run4"

date +"%F %T prepared for elections"
