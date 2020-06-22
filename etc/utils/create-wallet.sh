cd "${KEYS_DIR}"
"fift" -I "${FIFTPATH}" -s new-wallet.fif -1 \
  "validator" >"${KEYS_DIR}/validator-dump"
grep "Non-bounceable address" "${KEYS_DIR}/validator-dump" | awk '{print $5}' >"${KEYS_DIR}/validator-wallet"
# shellcheck disable=SC2086
echo "INFO: validator wallet = $(cat ${KEYS_DIR}/validator-wallet)"
echo "INFO: validator wallet dump = $(cat ${KEYS_DIR}/validator-dump)"
