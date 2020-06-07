WORKDIR /var/gram
ENV DOCKERBUILD=1
COPY ./ /var/gram
RUN du /var/gram
RUN ln -s /var/gram/bin/gram /usr/bin/gram
RUN gram build-docker-image