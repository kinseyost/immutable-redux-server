FROM node:6
WORKDIR /usr/src/app
EXPOSE 3000

COPY ./dockerInit.sh ./dockerInit.sh
CMD [ "bash", "./dockerInit.sh" ]
