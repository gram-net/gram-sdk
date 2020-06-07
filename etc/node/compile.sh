if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi
echo "usage: gram compile ?release|cross_compile|all|release_fresh|cross_compile_fresh|all_Fresh ?<build targets>"

if ! [ -d $GRAMCORE/ton ]; then
  git clone https://gitlab.com/gram-net/gram-ton.git $GRAMCORE/ton
  cd $GRAMCORE/ton
  git submodule update --init --recursive --remote
else
  cd $GRAMCORE/ton
  git pull || :
  git submodule update --recursive --remote
fi
cd $GRAMCORE

BUILDTARGETS="generate-random-id json-explorer lite-client blockchain-explorer validator-engine generate-initial-keys validator-engine-console gen_fif create-state rldp-http-proxy tonlib tonlibjson tonlibjson_static"
TONBUILD=$GRAMCORE/build/ton
TONBUILD_cross_compile=$GRAMCORE/build/ton-cc

echo "compile.sh - Used to build the TON library. It builds the following targets"
echo "BUILDTARGETS=${BUILDTARGETS}"
echo "* All of these targets are built using the cmake command (where \$i is one of the above targets): 'cmake --build ${BUILDDIR} --target \$i -- -j8'"
echo "* For partial builds or cross-compile the following arguments are available:"
echo "'release, cross_compile, all, release_fresh, cross_compile_fresh, all_fresh'"
echo "When using one of the 'fresh' commands, the '${BUILDDIR}' directory is deleted and recreated, and dependencies are re-installed."
echo "All of the following compiled executables are sym-linked in '/usr/local/bin/' : 'json-explorer validator-engine validator-engine-console lite-client fift func blockchain-explorer'"

COMPILER=g++
COMPILERC=gcc
if [ -n "$OSX" ]; then
  COMPILER=g++-9
  COMPILERC=gcc-9
fi

# -DCMAKE_BUILD_TYPE=MinSizeRel RelWithDebInfo Debug
export BUILD_OPTIONS="-DCMAKE_CXX_COMPILER=$(which ${COMPILER}) -DCMAKE_C_COMPILER=$(which ${COMPILERC}) -DCMAKE_BUILD_TYPE=Release \
  -DBUILD_SHARED_LIBS=OFF -DBUILD_STATIC_LIBS=ON"

if [[ "$OSTYPE" == "darwin"* ]]; then
  ZLIB_LIBRARY=/usr/local/opt/zlib/lib/libz.a
  ZLIB_INCLUDE_DIR=/usr/local/opt/zlib/include
  ZLIB_OPTIONS="-DZLIB_LIBRARY=$ZLIB_LIBRARY \
    -DZLIB_INCLUDE_DIR=$ZLIB_INCLUDE_DIR"
  OPENSSL_ROOT=/usr/local/opt/openssl
  OPENSSL_OPTIONS="-DOPENSSL_INCLUDE_DIR=$OPENSSL_ROOT/include \
    -DOPENSSL_CRYPTO_LIBRARY=$OPENSSL_ROOT/lib/libcrypto.a \
    -DOPENSSL_SSL_LIBRARY=$OPENSSL_ROOT/lib/libssl.a
    -DOPENSSL_LIBRARIES=\"$OPENSSL_SSL_LIBRARY;$OPENSSL_ROOT/lib/libcrypto.a\""
fi

if [ "$ARG2" != "" ]; then
  BUILDTARGETS="$ARG2"
fi
RELEASE=1
FRESH=0
CROSS_COMPILE=0
BUILDPATH=1
if [ "$ARG1" == "cross_compile" ]; then
  echo "Building for Cross Compile"
  CROSS_COMPILE=1
  BUILDPATH=0
  RELEASE=0
elif [ "$ARG1" == "paths" ]; then
  echo "Settings paths only"
  CROSS_COMPILE=0
  RELEASE=0
elif [ "$ARG1" == "all" ]; then
  echo "Building for Release && Cross Compile"
  CROSS_COMPILE=1
  RELEASE=1
elif [ "$ARG1" == "release_fresh" ]; then
  echo "Building FRESH for RELEASE"
  CROSS_COMPILE=0
  RELEASE=1
  FRESH=1
elif [ "$ARG1" == "cross_compile_fresh" ]; then
  echo "Building FRESH for Cross Compile"
  CROSS_COMPILE=1
  RELEASE=0
  FRESH=1
elif [ "$ARG1" == "all_fresh" ]; then
  echo "Building FRESH for Release && Cross Compile"
  RELEASE=1
  CROSS_COMPILE=1
  FRESH=1
fi

if [ $FRESH -eq 1 ]; then
  test -d $TONBUILD && rm -rf $TONBUILD
  test -d $TONBUILD_cross_compile && rm -rf $TONBUILD_cross_compile
fi

if [ $RELEASE -eq 1 ]; then
  mkdir -p $TONBUILD
  cd $TONBUILD
  cmake -B $TONBUILD -S $TON $BUILD_OPTIONS $OPENSSL_OPTIONS $ZLIB_OPTIONS

  echo "Building..."
  IFS=' '                          # space is set as delimiter
  read -ra TARG <<<"$BUILDTARGETS" # str is read into an array as tokens separated by IFS
  for i in "${TARG[@]}"; do        # access each element of array
    cmake --build $TONBUILD --target $i -- -j8
  done
  cd $GRAMCORE
fi

if [ $CROSS_COMPILE -eq 1 ]; then
  mkdir -p $TONBUILD_cross_compile
  cd $TONBUILD_cross_compile
  cmake -B $TONBUILD_cross_compile -S $TON $BUILD_OPTIONS $OPENSSL_OPTIONS $ZLIB_OPTIONS
  echo "Building cross compile"
  cmake --build $TONBUILD_cross_compile --target prepare_cross_compiling -- -j8
  cd $GRAMCORE
fi

if [ $BUILDPATH -eq 1 ]; then
  chmod 0755 $TONBUILD/validator-engine/validator-engine
  chmod 0755 $TONBUILD/validator-engine-console/validator-engine-console
  chmod 0755 $TONBUILD/lite-client/lite-client
  chmod 0755 $TONBUILD/crypto/fift
  chmod 0755 $TONBUILD/crypto/func
  chmod 0755 $TONBUILD/json-explorer/json-explorer
  chmod 0755 $TONBUILD/blockchain-explorer/blockchain-explorer
  chmod 0755 $TONBUILD/rldp-http-proxy/rldp-http-proxy
  chmod 0755 $TONBUILD/utils/generate-initial-keys
  chmod 0755 $TONBUILD/utils/generate-random-id
  chmod 0755 $TONBUILD/crypto/create-state

  if [ -n "$LINUX" ] && ! [ -n "$DOCKERBUILD" ]; then
    DOSUDO=sudo
  fi

  $DOSUDO rm -f /usr/local/bin/validator-engine >/dev/null 2>&1
  $DOSUDO rm -f /usr/local/bin/validator-engine-console >/dev/null 2>&1
  $DOSUDO rm -f /usr/local/bin/lite-client >/dev/null 2>&1
  $DOSUDO rm -f /usr/local/bin/fift >/dev/null 2>&1
  $DOSUDO rm -f /usr/local/bin/func >/dev/null 2>&1
  $DOSUDO rm -f /usr/local/bin/json-explorer >/dev/null 2>&1
  $DOSUDO rm -f /usr/local/bin/blockchain-explorer >/dev/null 2>&1
  $DOSUDO rm -f /usr/local/bin/rldp-http-proxy >/dev/null 2>&1
  $DOSUDO rm -f /usr/local/bin/generate-initial-keys >/dev/null 2>&1
  $DOSUDO rm -f /usr/local/bin/generate-random-id >/dev/null 2>&1
  $DOSUDO rm -f /usr/local/bin/create-state >/dev/null 2>&1

  $DOSUDO ln -s $TONBUILD/validator-engine/validator-engine /usr/local/bin/validator-engine
  $DOSUDO ln -s $TONBUILD/validator-engine-console/validator-engine-console /usr/local/bin/validator-engine-console
  $DOSUDO ln -s $TONBUILD/lite-client/lite-client /usr/local/bin/lite-client
  $DOSUDO ln -s $TONBUILD/crypto/fift /usr/local/bin/fift
  $DOSUDO ln -s $TONBUILD/crypto/func /usr/local/bin/func
  $DOSUDO ln -s $TONBUILD/json-explorer/json-explorer /usr/local/bin/json-explorer
  $DOSUDO ln -s $TONBUILD/blockchain-explorer/blockchain-explorer /usr/local/bin/blockchain-explorer
  $DOSUDO ln -s $TONBUILD/rldp-http-proxy/rldp-http-proxy /usr/local/bin/rldp-http-proxy
  $DOSUDO ln -s $TONBUILD/utils/generate-random-id /usr/local/bin/generate-random-id
  $DOSUDO ln -s $TONBUILD/utils/generate-initial-keys /usr/local/bin/generate-initial-keys
  $DOSUDO ln -s $TONBUILD/crypto/create-state /usr/local/bin/create-state
fi
