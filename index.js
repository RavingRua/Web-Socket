const express = require('express');
const app = new express;
const path = require('path');
const http = require('http');
const srv = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(srv);

app.use(express.static('./static'));

app.get('/', (req, res) => res.sendFile(path.resolve('index.html')));

io.on('connection', socket => {
    socket.send('hello ws');
});

srv.listen(80, 'localhost', () => console.log('http://127.0.0.1'));