FROM node:8

# Prepare app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app/

# Install dependencies
COPY package.json /usr/src/app/
RUN yarn

ADD . /usr/src/app/

EXPOSE 8081
CMD [ "yarn", "start" ]
