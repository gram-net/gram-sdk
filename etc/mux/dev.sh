if ! [ -n "$GRAMCLI" ] || ! [ -n "$GRAMMUX" ]; then
  echo "Run mux scripts using 'gram console dev'"
  exit 1
fi

export SRCDIR=$GRAMCORE/navigator/

declare -a muxpanes

muxpanes+=("gram help-dev")
muxpanes+=("gram navigator")
muxpanes+=("gram log/api")
muxpanes+=("gram lite-client")

export muxpanes

export LAYOUT=tiled