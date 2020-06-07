if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi
if [ -n "$DOCKERBUILD" ]; then
  fail "Deploy" "cannot use this script when building docker images"
fi
art

# store variable for zerostate script
ZEROSTATESCRIPT=$ARG1

# store old env node type
OLD_NODETYPE=$NODETYPE

# Build ENV if necessary
if ! [ -e $GRAMCORE/.env ]; then
  source gram env
elif ! [ -n "$DOCKERBUILD" ]; then
  ec "Current Environment:"
  cat $GRAMCORE/.env
  ENVUPDATE=
  while [ "$ENVUPDATE" != "yes" ] && [ "$ENVUPDATE" != "no" ]; do
    ec "Do you wish to update your environment? yes/no (press enter for no)"
    read ENVUPDATE
    if ! [ -n "$ENVUPDATE" ]; then ENVUPDATE="no"; fi
  done
  if [ "$ENVUPDATE" == "yes" ]; then
    source gram env
  fi
fi

# Get options
if [ "$OLD_NODETYPE" != "$NODETYPE" ]; then
  ec "Switching node type to ${NODETYPE} requires new key generation"
  test -e $PROFILE/.profile-done && rm -f $PROFILE/.profile-done
  if [ "$NODETYPE" == "regtest" ]; then
    ec "Switching node type to regtest requires clearing TONDB"
    CLEARTONDB="yes"
  fi
fi

if [ -e $PROFILE/.profile-done ]; then
  while [ "$PROFILEUPDATE" != "yes" ] && [ "$PROFILEUPDATE" != "no" ]; do
    ec "Do you wish to clear your profile and keys? yes/no (press enter for no)"
    read PROFILEUPDATE
    if ! [ -n "$PROFILEUPDATE" ]; then PROFILEUPDATE="no"; fi
  done
fi

if [ -e $TONDB/config.json ]; then
  while [ "$CLEARTONDB" != "yes" ] && [ "$CLEARTONDB" != "no" ]; do
    ec "Do you wish to clear blockchain database? yes/no (press enter for no)"
    read CLEARTONDB
    if ! [ -n "$CLEARTONDB" ]; then CLEARTONDB="no"; fi
  done
fi

if [ "$PROFILEUPDATE" == "yes" ] || ! [ -e $PROFILE/.profile-done ]; then
  if [ "$NODETYPE" == "regtest" ]; then
    ec "Rebuilding regtest profile requires clearing TONDB"
    CLEARTONDB="yes"
  fi
  test -d $PROFILE && rm -rf $PROFILE
  gram node/${NODETYPE} $ZEROSTATESCRIPT
  rm -rf **/*-e >/dev/null 2>&1
  echo "DONE" >$PROFILE/.profile-done
fi
if [ "$CLEARTONDB" == "yes" ] && [ -e $TONDB/config.json ]; then
  test -d $GRAMCORE/tondb-tmp && rm -rf $GRAMCORE/tondb-tmp
  mkdir $GRAMCORE/tondb-tmp
  cp -r $TONDB/config.json $GRAMCORE/tondb-tmp
  cp -r $TONDB/keyring $GRAMCORE/tondb-tmp
  cp -r $TONDB/static $GRAMCORE/tondb-tmp
  test -d $TONDB && rm -rf $TONDB
  cp -r $GRAMCORE/tondb-tmp $TONDB
  rm -rf $GRAMCORE/tondb-tmp
fi
# pull latest image
if [[ "$IMAGEURI" =~ (gitlab|github|http) ]]; then
  ec "Pulling image"
  docker pull $IMAGEURI
fi

# check build
if [ "$DEPLOYTYPE" == "compose" ]; then
  docker-compose up -d
elif [ "$DEPLOYTYPE" == "swarm" ]; then
  gram deploystack Force $GRAMCORE/docker-compose.yml
elif [ "$DEPLOYTYPE" == "metal" ]; then
  gram launch
else
  fail "Deploy" "Unknown DEPLOYTYPE"
fi
echo "http://${GRAM_IP}:${DOCS_PORT}/#/ for Docs"
echo "http://${GRAM_IP}:${NAV_PORT} for GRAM Navigator"
echo "'gram mux' for terminal logs"
