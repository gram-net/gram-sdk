# UBUNTU DOCKER INSTALLATION

This documentation only works on Ubuntu right now

> Become root
`sudo su -`

> Prepare to install
```bash
apt-get update

apt-get install software-properties-common

# Add the GPG key for the official Docker repository to the system:
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# Add the Docker repository to APT sources:
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable edge"
# > OR on other distros: `add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable edge test"`
#Next, update the package database with the Docker packages from the newly added repo:

# Make sure you are about to install from the Docker repo instead of the default repo:
apt-cache policy docker-ce
```

Install docker-ce
`apt-get install -y docker-ce`

Allow docker to run without sudo
```bash
# enter the username you want to use if you don't want to use 'ubuntu'
usermod -aG docker ubuntu
newgrp docker
```

Start docker service
`systemctl enable docker`

Download the Docker Compose binary into the /usr/local/bin directory with the following curl command:

`curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`

Once the download is complete, apply executable permissions to the Compose binary:
`chmod +x /usr/local/bin/docker-compose`

Verify the installation by running the following command which will display the Compose version:
`docker-compose --version`

Exit root shell
`exit`