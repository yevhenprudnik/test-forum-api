FROM node:16.17.0

WORKDIR /usr/src/test-pj

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]