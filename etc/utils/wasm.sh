TARGET=$ARG1
BUILDTYPE=$ARG2
REGENJS=1

if [ "$BUILDTYPE" == "release" ]; then
  CLEAN=1
fi
if [ "$BUILDTYPE" == "debug" ]; then
  SKIPOPTIM=1
  CLEAN=1
fi
if [ "$BUILDTYPE" == "skipoptim" ]; then
  SKIPOPTIM=1
fi
# a blank BUILDTYPE, 'test', or any string builds an optimized build without running CLEAN
# if [ "$BUILDTYPE" == "test" ]; then

# fi

FASTCOMP=$3
if [ "$FASTCOMP" != "" ]; then
  ec "EMSDK FASTCOMP"
  FASTCOMP=fastcomp
fi

ASMASYNC=$4
if [ "$ASMASYNC" != "" ]; then
  ec "EMTERPRETER ASYNC OPS ON"
  ASMASYNC=async
fi

USAGE=1
if [ "$TARGET" == "fift" ] || [ "$TARGET" == "func" ]; then
  USAGE=0
fi

if [ "$USAGE" == "1" ]; then
  echo "usage: ./wasm.sh [fift|func] [debug|release|deps|copy-only|full]? [fastcomp]?"
  echo "example for STAGING: ./wasm.sh fift"
  echo "example for sourcemap DEBUG: ./wasm.sh fift debug"
  echo "example with CLEAN-RELEASE install: ./wasm.sh fift release"
  echo "ARG 2: deps: rebuilds openssl/microhttpd/zlib"
  echo "ARG 2: full: rebuilds emsdk and deps"
  echo "ARG 2: copy-only: does not build anything, only re-seds and copies files to build directories"
  echo "ARG 3: fastcomp: uses EMSDK latest-fastcomp instead of latest (upstream)"
  echo -e "\n"
  exit 1
fi

BUILDSSL=0
BUILDMHD=0
BUILDEMSDK=0

MHD=libmicrohttpd-0.9.70
OPENSSL=OpenSSL_1_1_1f
ZLIB=1.2.11

if [ "$BUILDTYPE" == "full" ]; then
  BUILDEMSDK=1
fi

if [ "$BUILDTYPE" == "deps" ] || [ "$BUILDTYPE" == "full" ]; then
  CLEAN=1

  if [ "$TARGET" == "fift" ]; then
    BUILDZLIB=1
    BUILDSSL=1
  fi
fi

ec ""
echo "BUILDTYPE=${BUILDTYPE}"
echo "BUILDEMSDK=${BUILDEMSDK}"
echo "BUILDZLIB=${BUILDZLIB}"
echo "BUILDSSL=${BUILDSSL}"
echo "BUILDMHD=${BUILDMHD}"
echo "CLEAN=${CLEAN}"
echo "TARGET=${TARGET}"
echo "REGENJS=${REGENJS}"
echo "FASTCOMP=${FASTCOMP}"
ec ""

BUILDDIR=$GRAMCORE/build/wasm
mkdir -p $BUILDDIR

BUILD_OPTIONS="-DFASTCOMP=${FASTCOMP} -DASMASYNC=${ASMASYNC} -DJAVA_HEAP_SIZE=4096M -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF"

ZLIB_LIBRARY=$BUILDDIR/zlib-$ZLIB/build/libz.a
ZLIB_INCLUDE_DIR=$BUILDDIR/zlib-$ZLIB/build
ZLIB_OPTIONS="-DZLIB_LIBRARY=$ZLIB_LIBRARY -DZLIB_INCLUDE_DIR=${ZLIB_INCLUDE_DIR}"

MHD_LIB=$BUILDDIR/libs/mhd/lib
MHD_INC=$BUILDDIR/libs/mhd/includef
MHD_OPTIONS="-DMHD_LIBRARY=$MHD_LIB -DMHD_INCLUDE_DIR=$MHD_INC"

OPENSSL_ROOT=$BUILDDIR/libs/openssl
OPENSSL_CRYPTO_LIBRARY=$OPENSSL_ROOT/lib/libcrypto.a
OPENSSL_SSL_LIBRARY=$OPENSSL_ROOT/lib/libssl.a

OPENSSL_OPTIONS="-DOPENSSL_INCLUDE_DIR=$OPENSSL_ROOT/include \
-DOPENSSL_ROOT_DIR=$OPENSSL_ROOT \
-DOPENSSL_CRYPTO_LIBRARY=$OPENSSL_CRYPTO_LIBRARY \
-DOPENSSL_SSL_LIBRARY=$OPENSSL_SSL_LIBRARY \
-DOPENSSL_VERSION=$OPENSSL \
-DOPENSSL_LIBRARIES=\"$OPENSSL_SSL_LIBRARY;$OPENSSL_CRYPTO_LIBRARY\""

if [ "$BUILDEMSDK" == "1" ]; then
  rm -rf $BUILDDIR/emsdk
  mkdir -p $BUILDDIR/emsdk
  #sdk-fastcomp-1.38.27-64bit
  if [ "$FASTCOMP" != "" ]; then
    FASTCOMPBUILDFLAG=-fastcomp
  fi
  git clone https://github.com/emscripten-core/emsdk.git $BUILDDIR/emsdk
  cd $BUILDDIR/emsdk && git checkout 1.39.11
  $BUILDDIR/emsdk/emsdk install latest${FASTCOMPBUILDFLAG}
  $BUILDDIR/emsdk/emsdk activate latest${FASTCOMPBUILDFLAG}
fi
source $BUILDDIR/emsdk/emsdk_env.sh

if [ "$BUILDSSL" == "1" ]; then
  if [ ! -f $BUILDDIR/$OPENSSL.tar.gz ]; then
    echo "Downloading OpenSSL sources..."
    cd $BUILDDIR && wget https://github.com/openssl/openssl/archive/$OPENSSL.tar.gz
  fi
  rm -rf $BUILDDIR/openssl-$OPENSSL
  echo "Unpacking OpenSSL sources..."
  sed -i
  cd $BUILDDIR && tar xzf $BUILDDIR/$OPENSSL.tar.gz
  cd $BUILDDIR/openssl-$OPENSSL && emconfigure $BUILDDIR/openssl-$OPENSSL/Configure no-asm no-pic no-tests no-ui no-threads linux-generic32 no-shared no-dso no-engine no-unit-test
  sed -i.bak 's/CROSS_COMPILE=.*/CROSS_COMPILE=/g' Makefile
  sed -i.bak 's/-ldl /-g/g' Makefile
  sed -i.bak 's/-O3/-Os/g' Makefile
  echo "Building OpenSSL..."
  cd $BUILDDIR/openssl-$OPENSSL
  emmake make depend
  emmake make -j 8

  rm -rf $BUILDDIR/libs/openssl
  mkdir -p $BUILDDIR/libs/openssl/lib
  cp $BUILDDIR/openssl-$OPENSSL/libcrypto.a $BUILDDIR/openssl-$OPENSSL/libssl.a $BUILDDIR/libs/openssl/lib
  cp -r $BUILDDIR/openssl-$OPENSSL/include $BUILDDIR/libs/openssl
fi

if [ "$BUILDMHD" == "1" ]; then
  if [ ! -f $BUILDDIR/$MHD.tar.gz ]; then
    echo "Downloading MHD sources..."
    cd $BUILDDIR && wget https://ftp.gnu.org/gnu/libmicrohttpd/$MHD.tar.gz
  fi
  rm -rf $BUILDDIR/$MHD
  echo "Unpacking MHD sources..."
  cd $BUILDDIR && tar xzf $BUILDDIR/$MHD.tar.gz
  cd $BUILDDIR/$MHD
  emconfigure $BUILDDIR/$MHD/configure --host=le32-linux --enable-shared=no --enable-static=yes
  sed -i.bak 's/CROSS_COMPILE=.*/CROSS_COMPILE=/g' Makefile
  sed -i.bak 's/-ldl /-g/g' Makefile
  sed -i.bak 's/-O3/-Os/g' Makefile
  echo "Building MHD..."
  emmake make -j 8

  rm -rf $BUILDDIR/libs/mhd
  mkdir -p $BUILDDIR/libs/mhd
  cp -r $BUILDDIR/$MHD/src/lib $BUILDDIR/libs/mhd
  cp -r $BUILDDIR/$MHD/src/include $BUILDDIR/libs/mhd
fi
if [ "$BUILDZLIB" == "1" ]; then
  if [ ! -f $BUILDDIR/v$ZLIB.tar.gz ]; then
    echo "Downloading ZLIB sources..."
    cd $BUILDDIR && wget https://github.com/madler/zlib/archive/v${ZLIB}.tar.gz
  fi
  ZLIBBUILDDIR=$BUILDDIR/zlib-$ZLIB
  rm -rf $ZLIBBUILDDIR
  echo "Unpacking ZLIB sources..."
  cd $BUILDDIR && tar xzf $BUILDDIR/v$ZLIB.tar.gz
  cd $ZLIBBUILDDIR
  rm -rf build && mkdir build && cd build/
  emcmake cmake $(realpath ..) -Wl,-g
  echo "Building ZLIB..."
  emmake cmake --build $(realpath .)
fi

function configModule() {

  if [ "$BUILDTYPE" == "copy-only" ]; then
    return
  fi

  BUILDTARGETDIR=$1
  EXPORT_NAME=$2
  BUILDTARGET=$3

  if [ "$BUILDTARGET" == "" ]; then
    BUILDTARGET=$BUILDTARGETDIR
  fi

  if [ "$SKIPOPTIM" != "" ]; then
    # normal optimization
    echo "NORMAL OPTIMIZATION"
    if [ "$FASTCOMP" != "" ]; then
      BUILDFLAGS="${BUILDFLAGS} --profiling --profiling-funcs -g3 -O0"
    else
      BUILDFLAGS="${BUILDFLAGS} --profiling --profiling-funcs -g4 -O0 \
      --pre-js ${BUILDDIR}/emsdk/upstream/emscripten/src/emscripten-source-map.min.js \
      --source-map-base ./"
    fi
  else
    # full optimization
    echo "FULL OPTIMIZATION"
    BUILDFLAGS="${BUILDFLAGS} -g0 -Oz"
    # --closure 1
    # -s IGNORE_CLOSURE_COMPILER_ERRORS=1 \
  fi

  if [ "$BUILDTARGET" == "func" ]; then

    # \"main\", \
    WHITELIST="[
    \"dynCall_i\", \
    \"funC::parse_source_stdin()\", \
    \"funC::parse_source(std::__2::basic_istream<char, std::__2::char_traits<char> >*, src::FileDescr*, bool)\" \
    ]"
    ASYNCIFY_IMPORTS="'invoke_i','waitCmd'"
    EXPORTED_FUNCTIONS="['_main']"
  elif [ "$BUILDTARGET" == "fift" ]; then
    WHITELIST="[
    \"main\", \
    \"dynCall_viii\", \
    \"dynCall_ii\", \
    \"dynCall_viiiii\", \         
    \"fift::Fift::interpret_istream(std::__2::basic_istream<char, std::__2::char_traits<char> >&, std::__2::basic_string<char, std::__2::char_traits<char>, std::__2::allocator<char> >, bool)\", \
    \"fift::Fift::do_interpret(fift::IntCtx&)\", \
    \"fift::funny_interpret_loop(fift::IntCtx&)\" \
    ]"
    ASYNCIFY_IMPORTS="'invoke_ii','invoke_viii','invoke_viiiii','waitCmd'"
    EXPORTED_FUNCTIONS="['_main']"
  fi

  if [ "$FASTCOMP" != "" ]; then
    # -s SEPARATE_ASM=1 \
    # -s SEPARATE_ASM_MODULE_NAME=${EXPORT_NAME}asm \
    # -s BINARYEN_TRAP_MODE=clamp \
    # -s EMTERPRETIFY_WHITELIST=['_main','hasCmd','*interpret*'] \
    # -s ALLOW_MEMORY_GROWTH=1 \
    # -s EMTERPRETIFY_WHITELIST=['__ZN4fift20funny_interpret_loopERNS_6IntCtxE'] \
    FASTCOMPFLAGS="-s INITIAL_MEMORY=32MB -s WASM=0"
    if [ "$ASMASYNC" != "" ]; then
      FASTCOMPFLAGS="${FASTCOMPFLAGS} \
      -s EMTERPRETIFY_FILE=${EXPORT_NAME}.bin \
      -s EMTERPRETIFY=1 \
      -s EMTERPRETIFY_ASYNC=1"
    fi
  else
    UPSTREAMFLAGS="-s INITIAL_MEMORY=8MB \
      -s ALLOW_MEMORY_GROWTH=1 \
      -s WASM=1 \
      -s ASYNCIFY=1 \
      -s MAXIMUM_MEMORY=48MB \
      -s ASYNCIFY_WHITELIST=@${BUILDDIR}/whitelist.txt \
      -s NODE_CODE_CACHING=1 \
      -s ASYNCIFY_IMPORTS=[${ASYNCIFY_IMPORTS}] \
    "
  fi
  echo ${WHITELIST} >${BUILDDIR}/whitelist.txt

  ec "WHITELIST"
  cat ${BUILDDIR}/whitelist.txt

  # https://github.com/emscripten-core/emscripten/blob/master/src/settings.js
  # https://emscripten.org/docs/tools_reference/emcc.html
  # https://emscripten.org/docs/compiling/Building-Projects.html

  # ERROR: no input files
  # this means you have a trailing space after a \

  ## MUST DO THIS when you switch between fastcomp and upstream
  # clear emscripten cache, exits after success,
  # so remove it to build again
  # you must run a CLEAN build (BUILDTYPE=debug|release) afterwards
  # --clear-cache \

  # automatically =0 when using ALLOW_MEMORY_GROWTH
  # -s ABORTING_MALLOC=0 \

  # i can't figure out how to do this and set DISABLE_EXCEPTION_CATCHING=2
  # setting DISABLE_EXCEPTION_CATCHING=1 causes fift errors to pass through as INTs
  # -s EXCEPTION_CATCHING_WHITELIST=@${BUILDDIR}/whitelist.txt \

  # this makes everything simply not work
  # -s ASYNCIFY_IGNORE_INDIRECT=1 \

  # so far have not needed this
  #  -s FORCE_FILESYSTEM=1 \

  # is default
  #  -s ERROR_ON_UNDEFINED_SYMBOLS=1 \

  # EXIT_RUNTIME=1 causes MEMORY LEAKS in upstream

  # -s FORCE_FILESYSTEM=1 \ have not needed this yet

  WASMFLAGS="-Werror,-Wunused-command-line-argument \
  --emit-symbol-map \
  -s EXIT_RUNTIME=0 \
  -s DEMANGLE_SUPPORT=1 \
  -s EXPORTED_FUNCTIONS=${EXPORTED_FUNCTIONS} \
  -s INVOKE_RUN=0 \
  -s ASSERTIONS=2 \
  -s EXTRA_EXPORTED_RUNTIME_METHODS=['callMain','FS','cwrap','ccall'] \
  -s DISABLE_EXCEPTION_CATCHING=0 \
  -s USE_ZLIB=1 \
  -s NODEJS_CATCH_EXIT=0 \
  -s NODEJS_CATCH_REJECTION=0 \
  -s EXPORT_ES6=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME=${EXPORT_NAME} \
  ${UPSTREAMFLAGS} ${FASTCOMPFLAGS} ${BUILDFLAGS}"

  if [ "$CLEAN" != "" ]; then
    rm -rf $BUILDDIR/$BUILDTARGETDIR
  fi
  mkdir $BUILDDIR/$BUILDTARGETDIR
  cd $BUILDDIR/$BUILDTARGETDIR

  ec "WASMFLAGS"
  echo "${WASMFLAGS}"

  ec "CMAKE FLAGS"
  echo "$ZLIB_OPTIONS $BUILD_OPTIONS $MHD_OPTIONS $OPENSSL_OPTIONS $TON"

  emcmake cmake -DWASMFLAGS="${WASMFLAGS}" $ZLIB_OPTIONS $BUILD_OPTIONS $MHD_OPTIONS $OPENSSL_OPTIONS $TON

  ec "Building $BUILDTARGETDIR to WebAssembly..."
  CMD="emmake cmake --build $BUILDDIR/$BUILDTARGETDIR --target $BUILDTARGET -- -j8"
  ec "\n$CMD\n"
  $CMD
  ec "\nDONE\n"
}

function dosed() {
  BUILDPATH=$BUILDDIR/$1
  BUILDTARGET=$2
  EXPORT_NAME=$3

  WASMDIR=$GRAMCORE/wasm
  APPDIR=$GRAMCORE/navigator/public/wasm
  WASMASSETSDIR=$WASMDIR/wasm
  WASMSRCDIR=$WASMDIR/src/wasm

  mkdir -p $WASMASSETSDIR

  if [ "$FASTCOMP" == "" ]; then
    cp $BUILDPATH/${BUILDTARGET}.wasm $WASMASSETSDIR
    cp $BUILDPATH/${BUILDTARGET}.wasm $APPDIR
    cp $BUILDPATH/${BUILDTARGET}.wasm.map $WASMASSETSDIR
    cp $BUILDPATH/${BUILDTARGET}.wasm.map $APPDIR
  else
    # cp $BUILDPATH/$BUILDTARGET.data $WASMASSETSDIR
    cp $BUILDPATH/${BUILDTARGET}.bin $WASMASSETSDIR
    cp $BUILDPATH/${BUILDTARGET}.bin $APPDIR
    cp $BUILDPATH/${BUILDTARGET}.js.mem $WASMASSETSDIR/${BUILDTARGET}${ASMASYNC}.js.mem
    cp $BUILDPATH/${BUILDTARGET}.js.mem $APPDIR/${BUILDTARGET}${ASMASYNC}.js.mem
  fi

  if [ "$REGENJS" != "" ]; then
    ec "COPYING FILES: $1 $2 $3"
    # cp $BUILDPATH/${BUILDTARGET}.worker.js $WASMASSETSDIR
    SRC=${WASMASSETSDIR}/${BUILDTARGET}${FASTCOMP}${ASMASYNC}.js
    cp $BUILDPATH/${BUILDTARGET}.js $SRC

    # echo "// @ts-nocheck\n$(cat $SRC)" > $SRC
    # template
    # sed -i '' -e "s//"

    # remove import.meta and let emscripten_source_map
    # and add ISNODE
    sed -i '' -e "s/var _scriptDir = import.meta.url;/let _scriptDir; let emscripten_source_map;var ISNODE = (typeof process === 'object' \&\& typeof process.versions === 'object' \&\& typeof process.versions.node === 'string');/" $SRC

    # fix source map url
    sed -i '' -e "s/var url[ |]=[ |]window.location.href+[\"|'].map[\"|']/var url = locateFile('${BUILDTARGET}.wasm.map')/" $SRC

    # do not send extra messages
    # sed -i '' -e "s/out(what);//" $SRC
    # sed -i '' -e "s/err(what);//" $SRC

    # allow crypto to be polyfilled
    sed -i '' -e "s/${EXPORT_NAME} = ${EXPORT_NAME} || {};/${EXPORT_NAME} = ${EXPORT_NAME} || {};const { crypto_module } = ${EXPORT_NAME};/" $SRC
    sed -i '' -e "s/require(\"crypto\");/crypto_module;/" $SRC

    # __dirname null;
    sed -i '' -e "s/__dirname/null/" $SRC

    #allow access to FS by class in standard mode
    sed -i '' -e "s/Module\[['|\"]onRuntimeInitialized['|\"]\]();/Module['onRuntimeInitialized'](Module);/" $SRC
    # allow access to FS by class in closure
    sed -i '' -e "s/\([a-z]\).onRuntimeInitialized();/\1.onRuntimeInitialized(\1);/" $SRC

    #source map stops on nodejs
    sed -i '' -e "s/Module\['preRun'\].push(emscripten_loadSourceMap);/if(!ISNODE){Module['preRun'].push(emscripten_loadSourceMap);}/g" $SRC
    sed -i '' -e "s/Module\['preRun'\] = \[emscripten_loadSourceMap\];/if(!ISNODE){Module['preRun'] = [emscripten_loadSourceMap];}/g" $SRC

    #source map remove require(path)
    sed -i '' -e "s/scriptDirectory = require('path').dirname(scriptDirectory) + '\/';//" $SRC

    # remove require() in node in standard mode
    sed -i '' -e "s/require(['|\"]fs['|\"])/null/g" $SRC
    sed -i '' -e "s/require(['|\"]path['|\"])/null/g" $SRC
    sed -i '' -e "s/filename = nodePath\['normalize'\](filename);//" $SRC
    sed -i '' -e "s/[a-z]=[a-z][a-z].normalize([a-z])//" $SRC
    sed -i '' -e "s/.dirname([a-z])//" $SRC

    # fix call to nodeFS standard and optim mode
    sed -i '' -e "s/nodeFS\[['|\"]readFileSync['|\"]\](filename,[ |]binary[ |]?[ |]null[ |]:[ |]['|\"]utf8['|\"])/FS.readFile(filename,{encoding:'binary'})/" $SRC
    # fix call to nodeFS in closure
    sed -i '' -e "s/[a-z][a-z].readFileSync([a-z],\([a-z]\)?null:['|\"]utf8['|\"])/${EXPORT_NAME}.FS.readFile(\1,{encoding:'binary'})/" $SRC

    # TODO fix unsupported closure calls to this
    # sed -i '' -e "s/function Rf(a){this.Tf();this.state=a;d.setAsyncState(a)}//" $SRC

    # load memory init file as array buffer (standard)
    # sed -i '' -e "s/readBinary(memoryInitializer)/Module['memoryInitializer']/" $SRC

    # load memory init file (closure)
    sed -i '' -e "s/var [a-z\$][a-z]=[a-z][a-z]([a-z][a-z|]);\([A-Za-z]\).set([a-z\$][a-z],8)}else{\([a-z][a-z]\)(\"memory initializer\");/\1.set(${EXPORT_NAME}.memoryInitializer,8)}else{\2('memory initializer');/" $SRC

    #source map
    sed -i '' -e "s/,window.sourceMap={SourceMapConsumer:require(\"source-map\/source-map-consumer\").SourceMapConsumer,SourceMapGenerator:require(\"source-map\/source-map-generator\").SourceMapGenerator,SourceNode:require(\"source-map\/source-node\").SourceNode}/; try {window.sourceMap={SourceMapConsumer:require('source-map\/source-map-consumer').SourceMapConsumer,SourceMapGenerator:require('source-map\/source-map-generator').SourceMapGenerator,SourceNode:require('source-map\/source-node').SourceNode}} catch(e) { console.log('NodeJS has no window object') }/" $SRC

    # node/web share same stdin-prompt (for non-closure only)
    sed -i '' -e "s/get_char:.*return tty.input.shift()/get_char: function (tty) {            if (!tty.input.length) {              var result = null; result = Module.prompt();                if (result !== null) {  result += '\\\n' }              if (!result) { return null; }              tty.input = intArrayFromString(result, true)            }            return tty.input.shift()/" $SRC

    # stdin quick fix for web testing with source map
    # (also works for closure since we don't use ASM in node/electron/web)
    sed -i '' -e "s/window.prompt(['|\"]Input: ['|\"])/${EXPORT_NAME}.prompt()/" $SRC

    # avoid flushing
    # sed -i '' -e "s/fflush(0);/{}/" $SRC

    # Node keepalive
    # sed -i '' -e "s/process\[\"on\"\](\"uncaughtException\",function(ex){if(!(ex instanceof ExitStatus)){throw ex}});process\[\"on\"\](\"unhandledRejection\",abort);//" $SRC
    sed -i '' -e "s/process\[[\"|']exit[\"|']\](status)/throw status/" $SRC
    # node keepalive (closure)
    sed -i '' -e "s/process.exit(\([a-z]\))/throw \1/" $SRC
    # export exitRuntime
    # sed -i '' -e "s/function postRun/Module\[\"exitRuntime\"\] = exitRuntime;function postRun/" $SRC

    # env stuff ? don't even nkow what this is
    # sed -i '' -e "s/if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(document.currentScript){scriptDirectory=document.currentScript.src}if(_scriptDir){scriptDirectory=_scriptDir}if(scriptDirectory.indexOf(\"blob:\")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.lastIndexOf(\"\/\")+1)}else{scriptDirectory=\"\"}//" $SRC
    cp $SRC $APPDIR
  fi
}

if [ "$TARGET" == "fift" ]; then
  configModule "fift" "fift"
  dosed "fift/crypto" "fift" "fift"
elif [ "$TARGET" == "func" ]; then
  configModule "func" "func"
  dosed "func/crypto" "func" "func"
fi
tput bel
