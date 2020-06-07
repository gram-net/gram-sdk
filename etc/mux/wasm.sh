if ! [ -n "$GRAMCLI" ] || ! [ -n "$GRAMMUX" ]; then
  echo "Run mux scripts using 'gram console wasm"
  exit 1
fi

export SRCDIR=$GRAMCORE/wasm/

declare -a muxpanes

muxpanes[0]="yarn && yarn build && yarn test"
muxpanes[1]="yarn watch"
muxpanes[2]="yarn serve"

export muxpanes

export LAYOUT=main-horizontal