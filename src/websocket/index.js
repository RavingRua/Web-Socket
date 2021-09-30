const hashWebSocketKey = require('./algorithm/hashWebSocketKey.js');
const unmask = require('./algorithm/unmask.js');
const encodeMessage = require('./algorithm/encodeMessage.js');
const fs = require('fs');
const events = require('events');
const http = require('http');
const path = require('path');
const util = require('util');

// opcode for WS to analysis payloads
const opcodes = {
    TEXT: 1,
    BINARY: 2,
    CLOSE: 8,
    PING: 9,
    PONG: 10
};

const WebSocketConnection = function (req, socket, upgradeHead) {
    let key = hashWebSocketKey(req.headers['sec-websocket-key']);

    socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n ' +
        'Upgrade: WebSocket\r\n ' +
        'Connection: Upgrade\r\n' +
        'sec-websocket-accept:' + key +
        '\r\n\r\n');

    socket.on('data', (buf) => {
        this.buffer = Buffer.concat([this.buffer, buf]);

        while (this._processBuffer()) {
            // process buffer while it contains complete frame
            console.log('complete frame');
        }
    });

    socket.on('close', (had_error) => {
        if (!this.closed) {
            this.emit('close', 1006);
            this.closed = true;
        }
    });

    this.socket = socket;
    this.buffer = new Buffer.alloc(0);
    this.closed = false;
}

util.inherits(WebSocketConnection, events.EventEmitter);

// send message
WebSocketConnection.prototype.send = function (obj) {
    let opcode;
    let payload;

    if (Buffer.isBuffer(obj)) {
        opcode = opcodes.BINARY;
        payload = obj;
    } else if (typeof obj === 'string') {
        opcode = opcodes.TEXT;
        payload = new Buffer(obj, 'utf-8');
    } else {
        throw new TypeError('Cannot send object. The message\'s type must be string or Buffer');
    }

    this._doSend(opcode, payload);
};

// close connection
WebSocketConnection.prototype.close = function (code, reason) {
    const opcode = opcodes.CLOSE;
    let buffer;

    if (code) {
        buffer = new Buffer(Buffer.byteLength(reason) + 2);
        buffer.writeUInt16BE(code, 0);
        buffer.write(reason, 2);
    } else {
        buffer = new Buffer(0);
    }
    this._doSend(opcode, buffer);
    this.closed = true;
}

// process incoming bytes
WebSocketConnection.prototype._processBuffer = function () {
    let buf = this.buffer;
    if (buf.length < 2) {
        // insufficient data
        console.log('insufficient data read');
        return;
    }

    let idx = 2;
    let b1 = buf.readUInt8(0);
    let fin = b1 & 0x80;
    let opcode = b1 & 0x0f;      // low four bits
    let b2 = buf.readUInt8(1);
    let mask = b2 & 0x80;
    let length = b2 & 0x7f;     // low 7 bits

    if (length > 125) {
        if (buf.length < 8) {
            // insufficient data
            console.log('insufficient data read');
            return;
        }
    }

    if (length === 126) {
        length = buf.readUInt16BE(2);
        idx += 2;
    } else if (length === 127) {
        // discard high 4 bits because this server cannot handle huge lengths
        const highBits = buf.readUInt32BE(2);
        if (highBits !== 0) {
            this.close(1009, "");
        }
        length = buf.readUInt32BE(6);
        idx += 8;
    }

    if (buf.length < idx + 4 + length) {
        // insufficient data
        console.log('insufficient data read');
        return;
    }

    mask = buf.slice(idx, idx + 4);
    idx += 4;
    let payload = buf.slice(idx, idx + length);
    payload = unmask(mask, payload);
    this._handleFrame(opcode, payload);

    this.buffer = buf.slice(idx + length);
    return true;
}

WebSocketConnection.prototype._handleFrame = function (opcode, buffer) {
    let payload;
    switch (opcode) {
        case opcodes.TEXT:
            payload = buffer.toString('utf8');
            this.emit('data', opcode, payload);
            break;
        case opcodes.BINARY:
            payload = buffer;
            this.emit("data", opcode, payload);
            break;
        case opcodes.PING:
            // Respond to pings with pongs
            this._doSend(opcodes.PONG, buffer);
            break;
        case opcodes.PONG:
            // Ignore pongs
            break;
        case opcodes.CLOSE :
            // Parse close and reason
            let code, reason;
            if (buffer.length >= 2) {
                code = buffer.readUInt16BE(0);
                reason = buffer.toString("utf8", 2);
            }
            this.close(code, reason);
            this.emit("close", code, reason);
            break;
        default:
            this.close(1002, "unknown opcode");
    }
}

// format and send message
WebSocketConnection.prototype._doSend = function (opcode, payload) {
    this.socket.write(encodeMessage(opcode, payload));
}

module.exports.listen = (port, host, handleConn) => {
    const srv = http.createServer((req, res) => {
        res.setHeader("200", {'Content-Type': 'text/html'});
        res.end(fs.readFileSync(path.resolve('index.html')).toString());
    });

    srv.on('upgrade', (req, socket, head) => {
        const ws = new WebSocketConnection(req, socket, head);
        handleConn(ws);
    });

    srv.listen(port, host);
};