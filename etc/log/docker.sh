if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
ART=log
art

if [ "$DEPLOYTYPE" == "compose" ]; then
  docker logs ${DOCKERPREFIX}_gram$SUFFIX 2>&1 | head -250
  docker logs ${DOCKERPREFIX}_gram$SUFFIX 2>&1
elif [ "$DEPLOYTYPE" == "swarm" ]; then
  runcmd docker service ps --no-trunc ${DOCKERPREFIX}_gram$SUFFIX
  docker service logs --tail=50 ${DOCKERPREFIX}_gram$SUFFIX 2>&1
else
  fail "Log docker" "Docker mode is off. run gram env to change to docker compose or swarm mode"
fi

