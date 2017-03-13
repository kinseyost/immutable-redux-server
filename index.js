/* eslint-disable no-console*/

import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import mongoose from 'mongoose';
import colors from 'colors';

import * as listeners from './listeners.js';

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

mongoose.connect('mongodb://localhost/test');

const db = mongoose.connection;
db.on('error', (err) => {
  console.error.bind(console, 'connection error:');
  server.close(function() {
    console.log(colors.red("Failure to connect to mongodb, Shutting down"));
    process.exit();
  });
});
db.once('open', () => {
  console.log('connected to mongodb');
});
