/* eslint-disable no-console*/

import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import mongoose from 'mongoose';
import colors from 'colors';

import * as listeners from './listeners.js';

mongoose.Promise = global.Promise;

const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port = 8081;

// TODO store and retreive user data from mongo

io.on('connection', (socket) => {
  console.log(colors.yellow('client connected'));
  socket.on('io', async function (action) {
    try {
      const modifiedAction = await listeners[action.type](action);
      socket.emit('io', modifiedAction);
    } catch (err) {
      console.log(colors.red('I had an error:'), err);
      socket.emit('error', err);
    }
  });
});

server.listen(port, () => {
  console.log(`listening on :${port}`);
});

/* If running in docker use the container name, otherwise, localhost */
const url = process.env.DOCKER_DB ? 'mongo:27017' : 'localhost/test';
connectToDb();

function connectToDb() {
  mongoose.connect(`mongodb://${url}`);
}

const db = mongoose.connection;
db.on('error', (err) => {
  console.error.bind(console, 'connection error:');
  server.close(function() {
    console.log(err);
    setTimeout(() => {
      console.log('reconnecting');
      connectToDb()
    }, 1000);
  });
});
db.once('open', () => {
  console.log('connected to mongodb');
});
