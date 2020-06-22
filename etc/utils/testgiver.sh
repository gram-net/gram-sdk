TMP_DIR="${PROFILE}/tmp"
cd $TMP_DIR
DEST_ADDR=$ARG1
source gram lc runmethod kf9mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZnw8 seqno
echo "DEST_ADDR: ${DEST_ADDR}"
echo "GIVER SEQNO: $LC_RESFINAL"
set -x
fift -I $FIFTPATH -s testgiver.fif $DEST_ADDR $LCRES_FINAL 20 $TMP_DIR/testgiver
set +x
echo "sending boc..."
lite-client --verbosity 9 -p ${LS_PUB} -a ${GRAM_IP}:${LITESERVER_PORT} -rc "sendfile ${TMP_DIR}/testgiver.boc" -rc "quit"
