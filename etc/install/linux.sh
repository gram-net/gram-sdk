if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi

if ! [ -n "$LINUX" ]; then
  fail "Installing linux deps" "not on Linux operating system"
fi
if ! [ -n "$DOCKERBUILD" ] && ! [ -e /swapfile ]; then
  ec "Creating a 4GB swap file"
  dd if=/dev/zero of=/swapfile bs=4096 count=1048576
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
fi
# TODO add more Chinese mirrors
if [ -n "$UBUNTU" ] && [ "$DOCKERBUILD" == "" ]; then
  ec "If you want to use a Chinese mirror, your sources list will need to change"
  echo "You can type 'yes' below to do this automatically"
  echo "archive.ubuntu.com will be changed to cn.archive.ubuntu.com in /etc/apt/sources.list"
  echo "THE CHANGE IS PERMANENT (type yes/no), leave blank for no"
  read USECHINAMIRROR
fi
if [ -n "$APT" ] && [ -n "$DOCKERBUILD" ] || [ "$USECHINAMIRROR" == "yes" ]; then
  cp /etc/apt/sources.list /etc/apt/sources.list.bak
  sed -i'' -e "s/http:\/\/.*archive.ubuntu.com/http:\/\/cn.archive.ubuntu.com/g" /etc/apt/sources.list
  ec "NOTICE: APT has been re-configured to use Chinese mirrors. A backup sources list has been created at /etc/apt/sources.list.bak"
fi
DEPSGLOBAL="vim tar git curl tmux chrony ca-certificates gnupg chrony make wget cmake tcpdump net-tools"
DEPSDNF="python2 zlib-devel glibc-headers readline-devel libmicrohttpd openssl-devel gperftools-devel gflags-devel"
DEPSYUM="python2 zlib-devel glibc-headers readline-devel libmicrohttpd openssl-devel gperftools-devel gflags-devel"
DEPSAPT="libtinfo5 python gcc pkg-config libgsl0-dev build-essential libghc-zlib-dev libreadline-dev libmicrohttpd-dev libssl-dev libgflags-dev gperf"

export DEBIAN_FRONTEND=noninteractive
export DEBCONF_FRONTEND=noninteractive

ec "Updating Linux packages, upgrading Linux and installing essential packages"
if [ -n "$AMZN" ]; then
  amazon-linux-extras install -y epel
fi

if [ -n "$DNF" ]; then
  dnf clean all
  dnf update -y
  dnf upgrade -y
  dnf install -y --setopt=install_weak_deps=False --best dnf-plugins-core
  dnf install -y --setopt=install_weak_deps=False https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
  # if you're on RHEL, you might want to add this
  # subscription-manager repos --enable "codeready-builder-for-rhel-8-*-rpms"
  dnf config-manager --set-enabled PowerTools
  dnf --setopt=install_weak_deps=False --best install -y $DEPSDNF $DEPSGLOBAL
elif [ -n "$YUM" ]; then
  yum clean all
  yum update -y
  yum upgrade -y
  yum install -y epel-release
  if ! [ -n "$AMZN" ]; then
    yum config-manager --set-enabled PowerTools
  fi
  yum install -y $DEPSYUM $DEPSGLOBAL
elif [ -n "$APT" ]; then
  apt-get update -y
  apt-get autoremove -y
  if [ -x dist-upgrade ]; then
    dist-upgrade -y
  else
    apt-get upgrade -y
  fi
  apt-get install -y --no-install-recommends $DEPSAPT $DEPSGLOBAL
  dpkg -i $GRAMCORE/libreadline7_7.0-3_amd64.deb | :
else
  ec "Unknown Linux package manager configuration. Exiting..."
  exit 1
fi

service chrony start || systemctl start chrony || systemctl start chronyd || :
service chronyd start || systemctl enable chrony || systemctl enable chronyd || :

ec "Setting file watcher limit"
echo fs.inotify.max_user_watches=524288 | tee /etc/sysctl.d/40-max-user-watches.conf || :
sysctl --system || :

GRAMBINPATH=linux_x64

ec "Linking pre-built Linux binaries"
rm -f /usr/local/bin/validator-engine || :
rm -f /usr/local/bin/validator-engine-console || :
rm -f /usr/local/bin/lite-client || :
rm -f /usr/local/bin/fift || :
rm -f /usr/local/bin/func || :
rm -f /usr/local/bin/json-explorer || :
rm -f /usr/local/bin/blockchain-explorer || :
rm -f /usr/local/bin/rldp-http-proxy || :
rm -f /usr/local/bin/generate-initial-keys || :
rm -f /usr/local/bin/generate-random-id || :
rm -f /usr/local/bin/create-state || :

ln -s $GRAMCORE/bin/$GRAMBINPATH/validator-engine /usr/local/bin/validator-engine
ln -s $GRAMCORE/bin/$GRAMBINPATH/validator-engine-console /usr/local/bin/validator-engine-console
ln -s $GRAMCORE/bin/$GRAMBINPATH/lite-client /usr/local/bin/lite-client
ln -s $GRAMCORE/bin/$GRAMBINPATH/fift /usr/local/bin/fift
ln -s $GRAMCORE/bin/$GRAMBINPATH/func /usr/local/bin/func
ln -s $GRAMCORE/bin/$GRAMBINPATH/json-explorer /usr/local/bin/json-explorer
ln -s $GRAMCORE/bin/$GRAMBINPATH/blockchain-explorer /usr/local/bin/blockchain-explorer
ln -s $GRAMCORE/bin/$GRAMBINPATH/rldp-http-proxy /usr/local/bin/rldp-http-proxy
ln -s $GRAMCORE/bin/$GRAMBINPATH/generate-random-id /usr/local/bin/generate-random-id
ln -s $GRAMCORE/bin/$GRAMBINPATH/generate-initial-keys /usr/local/bin/generate-initial-keys
ln -s $GRAMCORE/bin/$GRAMBINPATH/create-state /usr/local/bin/create-state
