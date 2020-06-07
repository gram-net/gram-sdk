TIME_DIFF=0
ART=log
art

"validator-engine-console" \
    -a ${GRAM_IP}:${CONSOLE_PORT} \
    -k "${PROFILE}/keys/client" \
    -p "${PROFILE}/keys/server.pub" \
    -c "getstats" -c "quit"

for i in $("validator-engine-console" \
    -a ${GRAM_IP}:{$CONSOLE_PORT} \
    -k "${PROFILE}/keys/client" \
    -p "${PROFILE}/keys/server.pub" \
    -c "getstats" -c "quit" 2>&1 | grep time | awk '{print $2}'); do
    TIME_DIFF=$((i - TIME_DIFF))
done

echo "INFO: TIME_DIFF = ${TIME_DIFF}"
