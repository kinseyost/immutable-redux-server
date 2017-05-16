/* eslint-disable no-console*/

import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import mongoose from 'mongoose';
import colors from 'colors';
import socketIoRedis from 'socket.io-redis';

import * as listeners from './listeners.js';

const isRunningInDocker = process.env.DOCKER_DB;

const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port = 8081;
const host = isRunningInDocker ? 'redis' : 'localhost';

io.adapter(socketIoRedis({ host, port: 6379 }));

io.on('connection', (socket) => {
  console.log('client connected', socket.id);
  socket.join('room1');
  listeners.initIO(io); // store instance of io in listeners module
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
const url = isRunningInDocker ? 'mongo:27017' : 'localhost/test';
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
