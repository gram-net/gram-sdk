if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
#### PASSWORD validation upon deployment ####
checkPassword(){
    if [ -f /opt/ton/ton.password ]; then
        echo "Environment is password protected. Verifying..."
        environmentPassword=$(cat /opt/GRAM1/deploy.password)
        if [ "${environmentPassword}" != "$password" ]; then
            echo "****************************************"
            echo "Password is invalid for this environment."
            #echo "Provided password: $password"
            #echo "Required password: $environmentPassword"
            echo "****************************************"
            exit 1;
        else
            echo "Password validation successful."
        fi
    else
        echo "Environment is not password protected."
    fi
}

validateYml(){
   echo "validating YML (TODO)"
}

revealYml(){
    echo "Deploying ${stackName} stack with contents: "
    cat docker-compose.yml
}

startStack(){
    # validateYml
    # revealYml
    docker stack deploy ${stackName} --compose-file docker-compose.yml --with-registry-auth
}

stopStack(){
    set +e
    docker stack rm ${stackName}
    set -e
    limit=60
    until [ -z "$(docker service ls --filter label=com.docker.stack.namespace=${stackName} -q)" ] || [ "${limit}" -lt 0 ]; do
        echo "(${limit}) Waiting for all services to die..."
        sleep 1;
        limit=$((limit-1))
    done
    limit=60
    until [ -z "$(docker network ls --filter label=com.docker.stack.namespace=${stackName} -q)" ] || [ "${limit}" -lt 0 ]; do
        echo "(${limit}) Waiting for all networks to die..."
        sleep 1;
        limit=$((limit-1))
    done
}

##################################################################
#  Execution starts here.
##################################################################

if [[ $# -lt 2 || $# -gt 3 ]]; then
    echo "Usage: $0 <deploymentType> <composeFile> [password]."
    echo "       deploymentType is either Force or Incremental"
    echo "       composeFile is the path to the docker-compose.yml file to use."
    exit 1
fi

deploymentType="$ARG1"
composeFile="$ARG2"
password="$ARG3"
stackName="GRAM1"

checkPassword;
if [ "${deploymentType}" == "Force" ]; then
    stopStack
    startStack
elif [ "${deploymentType}" == "Incremental" ]; then
    startStack
elif [ "${deploymentType}" == "Shutdown" ]; then
    stopStack
elif [ "${deploymentType}" == "Clean" ]; then
    echo "Nothing to do, exiting."
else
    echo "Unknown deployment type ${deploymentType}"
    exit 1
fi
