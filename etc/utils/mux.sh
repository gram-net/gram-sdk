if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
art
if [ -n "$TMUX" ]; then
  ec "Already in a tmux session"
  exit;
fi

export GRAMMUX=1
if ! [ -n "$ARG1" ]; then
  export S="log"
else
  export S=$ARG1
fi

tmux detach-client -t ${S} || : 
tmux kill-session -t ${S} || : 
source gram mux/$S

tmux -f "${GRAMCORE}/.tmux.conf" new -d -s ${S} -n ${S} -c $SRCDIR

COUNT=0
for i in "${muxpanes[@]}"; do 
  echo $i
  if [ "$COUNT" != "0" ]; then tmux splitw -h -t ${S} -c $SRCDIR; fi
  tmux send-keys -t ${S}.${COUNT} "$i" Enter
  COUNT=$(($COUNT+1))
done

tmux select-layout $LAYOUT
tmux select-pane -t 0

tmux attach -d -t ${S}

