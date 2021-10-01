const express = require('express');
const app = new express;
const path = require('path');
const http = require('http');
const srv = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(srv, {
    cors: {
        methods: ['*']
    }
});

app.use(express.static('./static'));

app.get('/', (req, res) => res.sendFile(path.resolve('index.html')));
app.get('/vite', (req, res) => res.sendFile(path.resolve('static/vite/index.html')))

io.on('connection', socket => {
    console.log('user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat-message', (msg) => {
        console.log('incoming message:', msg);
    });

    socket.on('error', (e) => console.error(e));
});


// srv.listen(80, 'localhost');
srv.listen(80, 'localhost', () => {
    console.log('http://127.0.0.1');
    console.log('http://127.0.0.1/vite');
});