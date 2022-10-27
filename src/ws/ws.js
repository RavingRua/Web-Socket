const ws = require("ws");

const wss = new ws.WebSocketServer({port: 8080});

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        console.log('received: ', data.toString());
    });

    ws.send('something');
});