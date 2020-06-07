FROM ubuntu:20.04
# this is used for testing purposes
WORKDIR /var/gram
ENV DOCKERBUILD=1
COPY ./etc/art /var/gram/etc/art
COPY ./etc/lib /var/gram/etc/lib
COPY ./bin/gram /var/gram/bin/gram
RUN ln -s /var/gram/bin/gram /usr/bin/gram
COPY ./etc/install/linux.sh /var/gram/etc/install/linux.sh
RUN gram linux
COPY ./etc/install/nodejs.sh /var/gram/etc/install/nodejs.sh
RUN gram nodejs
COPY ./etc/node/compile.sh /var/gram/etc/node/compile.sh
RUN gram compile release
COPY ./etc/utils/build-navigator.sh /var/gram/etc/utils/build-navigator.sh
COPY ./navigator /var/gram/navigator
COPY ./wasm /var/gram/wasm
RUN gram build-navigator
COPY ./ /var/gram
RUN du /var/gram
COPY ./etc/utils/build-api.sh /var/gram/etc/utils/build-api.sh
COPY ./api /var/gram/api
RUN gram build-api