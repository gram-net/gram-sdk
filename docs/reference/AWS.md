
# AWS Admin Reference

[TOC]

## Routing the API through a domain on AWS

> `testnet-master` is the *instance name*

* ec2 -> loadbalancer -> testnet-master = this is where it declared to use ssl
* ec2 -> targetgroup -> testnet-master = this is where it points to the instance IP:port

## Instance crash in AWS

In EC2 instance console, select instance then select  
> action button -> instance settings -> get system log

## Mounting EBS volumes

<https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-using-volumes.html>

Make sure you take note of the directory where you mount your volume, and clone the GRAM repository directly into the root of your volume.

## AWS API Credentials Sign-in

### AWS OSX

`brew install awscli`
`brew upgrade awscli`

### AWS Linux

`apt-get install awscli`
`apt-get upgrade awscli`

### Register your credentials with AWS

`aws configure`
Now enter your AWS API keys
For the zone, enter `ap-northeast-1` (or use whatever zone you are working in, this is required and important)

### Log into docker repository

`eval "$(aws ecr get-login-password)"`
This command might be different for you, if you're not using AWS
