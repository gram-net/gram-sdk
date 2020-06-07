GCCBUILDDIR=$GRAMCORE/build/gcc
mkdir -p $GCCBUILDIR
GCC_VERSION=9.3.0
wget https://ftp.gnu.org/gnu/gcc/gcc-${GCC_VERSION}/gcc-${GCC_VERSION}.tar.gz
tar xzvf gcc-${GCC_VERSION}.tar.gz
mkdir obj.gcc-${GCC_VERSION}
cd gcc-${GCC_VERSION}
./contrib/download_prerequisites
cd ../obj.gcc-${GCC_VERSION}
../gcc-${GCC_VERSION}/configure --disable-multilib --enable-languages=c,c++
make -j $(nproc)
make install
