if ! [ -n "$GRAMCLI" ] || ! [ -n "$GRAMMUX" ]; then
  echo "Run mux scripts using 'gram console log"
  exit 1
fi

export SRCDIR=$GRAMCORE/

declare -a muxpanes

if [ -n "$RUNAPI" ]; then
  muxpanes+=("${DOCKER_CMDPREFIX} gram log/api")
fi
if [ -n "$RUNVALIDATOR" ]; then
  muxpanes+=("${DOCKER_CMDPREFIX} gram log/validator")
fi
muxpanes+=("${DOCKER_CMDPREFIX} gram pm2")
muxpanes+=("gram config-helper; gram help; ${DOCKER_CMDPREFIX} gram log/sync; echo ${DOCKER_CMDPREFIX}")

export muxpanes

export LAYOUT="tiled"
