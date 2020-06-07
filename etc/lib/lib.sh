if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"
  gram help
  exit 1
fi

# exit 1;
# quick shortcut to print something with whitespace
ec() {
  echo -e "\n--- ${1}"
}
export -f ec

debug() {
  if [ "$DEBUG" == "1" ]; then
    echo $@
  fi
}

ecprompt() {
  echo -e "\n??? $1"
}

fail() {
  cat $ETC/art/fail.txt
  ec "$1 FAILED: $2"
}
# quick shortcut to run a command with a clear print-out and exit if it fails
runcmd() {
  echo $1
  ${1} || fail $1 $2
  echo "_______DONE ${1}_______"
}
export -f runcmd

# no env var with IP, so we set it to localhost
if ! [ -n "$IP" ]; then
  echo "ERROR: Cannot get IP from ENV. Setting to localhost 127.0.0.1"
  IP=127.0.0.1
fi

if ! [ -n "$PROFILE" ]; then
  export PROFILE=$(realpath ${GRAMCORE}/profile)
else
  export PROFILE=$(realpath ${PROFILE})
fi

if ! [ -n "$TONDB" ]; then
  export TONDB=$(realpath ${GRAMCORE}/tondb)
else
  export TONDB=$(realpath ${TONDB})
fi

if [[ "$OSTYPE" == *"darwin"* ]]; then
  export OSX=1
elif [[ "$OSTYPE" == *"linux"* ]]; then
  export LINUX=1

  # old linux/weird linux not supported
  if ! [ -r /etc/os-release ]; then
    ec "Your linux distribution is not supported by GRAM. Exiting..."
    exit 1
  fi

  source /etc/os-release
  ec "Your Linux Distribution: $ID:$VERSION_ID $ID_LIKE"

  # sles,rhel are not supported
  # rhel,debian,ubuntu,centos,amzn,linuxmint,kali are supported
  # anything that is 'like' debian or fedora should work

  MAXVERSION=9999 # hacky AF
  case $ID in
  amzn)
    AMZN=1
    MINVERSION=2
    YUM=1
    ;;
  fedora)
    FEDORA=1
    MINVERSION=31
    FEDORA31=$(echo "$VERSION_ID 31" | awk '{print ($1 >= $2)}')
    if [ "$FEDORA31" = "1" ]; then
      DNF=1
    else
      YUM=1
    fi
    ;;
  debian)
    DEBIAN=1
    MINVERSION=8
    APT=1
    ;;
  ubuntu)
    UBUNTU=1
    MINVERSION=18
    APT=1
    ;;
  linuxmint)
    MINT=1
    MINVERSION=18
    APT=1
    ;;
  kali)
    KALI=1
    MINVERSION=2020
    APT=1
    ;;
  centos)
    CENTOS=1
    MINVERSION=7
    CENTOS8=$(echo "$VERSION_ID 8" | awk '{print ($1 >= $2)}')
    if [ "$CENTOS8" = "1" ]; then
      DNF=1
    else
      YUM=1
    fi
    ;;
  *)
    if [[ "$ID_LIKE" =~ (debian|ubuntu) ]] || [[ "$ID" =~ (debian|ubuntu) ]]; then
      LIKEDEBIAN=1
      APT=1
    elif [[ "$ID_LIKE" =~ (rhel|fedora|centos) ]] || [[ "$ID" =~ (rhel|fedora|centos) ]]; then
      LIKEFEDORA=1
      YUM=1
    else
      ec "ERROR. You are using an unsupported Linux distribution. Exiting..."
      echo "If you need support for your distribution, contact the GRAM developers."
      exit 1
    fi
    ;;
  esac

  # ec "Checking operating system version compatibility"

  CHECKMIN=$(echo "$VERSION_ID $MINVERSION" | awk '{print ($1 >= $2)}')
  CHECKMAX=$(echo "$VERSION_ID $MAXVERSION" | awk '{print ($1 <= $2)}')

  if ! [ -n "$MINVERSION" ] || ! [ -n "$VERSION_ID" ]; then
    ec "WARNING. You seem to be using a non-supported Linux distribution!"
    echo "GRAM might still work, but you might have to fix issues such as old dependencies"
    echo "If you need assistance, contact the GRAM developers."
  elif [ "$CHECKMIN" == "0" ] || [ "$CHECKMAX" == "0" ]; then
    ec "Operating system version not supported"
    echo "GRAM might still work."
    echo "If you need support for this version or believe this message is an error, contact the GRAM developers."
  fi

  # ec "Checking package manager compatibility"

  if [ -n "$DNF" ] && ! [ $(command -v dnf) ]; then
    PACKAGE_MANAGER_ERROR=1
  fi
  if [ -n "$APT" ] && ! [ $(command -v apt-get) ]; then
    PACKAGE_MANAGER_ERROR1
  fi
  if [ -n "$YUM" ] && ! [ $(command -v yum) ]; then
    PACKAGE_MANAGER_ERROR=1
  fi

  if [ "$PACKAGE_MANAGER_ERROR" ]; then
    ec "Your operating system does not use the default package manager."
    echo "If you need special support, contact GRAM developers."
    echo "Exiting due to incompatible host operating system configuration..."
    exit 1
  fi
fi
