FROM ubuntu:20.04
WORKDIR /var/gram
ENV DOCKERBUILD=1
COPY . /var/gram
RUN du /var/gram
RUN ln -s /var/gram/bin/gram /usr/bin/gram
RUN gram linux
RUN gram nodejs