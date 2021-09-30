const path = require('path');
const {Server} = require('socket.io');
const WebSocket = require('websocket').server;
const express = require('express');
const http = require('http');

const app = new express();
const server = http.createServer(app);
const io = new Server(server);
const ws = new WebSocket({httpServer: server});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

io.on('connection', socket => console.log('socket connected'));

server.listen(3000, 'localhost', () => console.log('http://127.0.0.1:3000'));