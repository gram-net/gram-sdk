# GRAM Docker Admin Reference

[TOC]

## See the [main README.md](../README.md) for installation.

## Command reference

Remove ALL containers/images
`docker rm $(docker ps -aq) && docker image prune -a`

see docker container / service logs
`gram log/docker`

pull latest image (if ENV file is set to a remote image)
`docker pull \$IMAGEURI`

## Build GRAM Docker image on local machine

> Allocate a minimum of 12GB of RAM, 2GB SWAP, and 8 CPUs to Docker

See a list of available operating systems to build docker images on
`gram image`

### For release

This command will clear everything from your local installation and build everything fresh. Since it copies the binaries from your local machine, you will want to use Ubuntu 20.04 LTS to do this, unless you change `dockerfiles/release.dockerfile` to use a different base image

`gram image release`

### For debugging purposes

Build docker images that compile the node on the target OS
add `--nocache` if needed
Note the command requires `_` instead of `:`. It is used in 'FROM ubuntu:20.04' by replacing the `_` with `:`
`gram image ubuntu_20.04'

## Pushing Docker Images

Log into docker registry
`docker login $REGISTRYURL -u $REGISTRY_USERNAME -p $REGISTRY_TOKEN`

Example:
`docker login registry.gitlab.com/gram-net/gram -u myusername -p mytoken`

Tag local image with remote registry URL
`docker tag $IMAGENAME $REGISTRYURL:$VERSION`

Example:
`docker tag gram-net/gram:local registry.gitlab.com/gram-net/gram:0.0.1`

Push image
`docker push ${REGISTRYURL}/${REGISTRYNAME}/${REGISTRYLOGINURL}:${REGISTRYTAG}`

Example:
`docker push registry.gitlab.com/gram-net/gram:0.0.1`

## Docker Compose Reference

```bash
# to stop services
docker-compose down gram

# to start services
# remove `-d` to run in foreground
docker-compose up -d gram
```

```bash
# for service startup
docker service ps --no-trunc gram_gram_1

# for service runtime
docker logs --tail 100 gram_gram_1
```

## Docker Swarm Reference

### Start/stop swarm services

Run `docker ps`, then run `docker stop <containerId>` with the container id of the service you want to restart (example: `23sdf982`).

Note that this does NOT update the service with any new settings or data, docker swarm just replaces the missing container with a new one.

If you do this a lot, you might want to downgrade to `compose` mode to diagnose the issue.

### Use docker commands to check if the containers are running

`docker ps | grep node`
`docker ps | grep api`
`docker ps | grep explorer`

If the containers are restarting a lot, you can view the service logs

### swarm startup logs

```bash
docker service ps --no-trunc GRAM1_gram-api
docker service ps --no-trunc GRAM1_gram-node
docker service ps --no-trunc GRAM1_json-explorer
```

### swarm runtime logs

```bash
# remove -f if you do not want to stream the logs
docker service logs -f --tail 100 GRAM1_gram-node
docker service logs -f --tail 100 GRAM1_json-explorer
docker service logs -f --tail 100 GRAM1_gram-api
```

## Lesser used commands

list GRAM images
`docker images | grep gram`

Example output:
`registry.gitlab.com/gram-net/gram   latest              5db932e8600d        17 hours ago        2.66GB`

Remove image using image ID
`docker rmi -f 5db932e8600d`

Remove stopped docker containers
`docker rm $(docker ps -qa --no-trunc --filter "status=exited")`

Quick clean up:
`docker image prune`

Find and remove images
`docker images -a`
`docker rmi -f <image name>`
