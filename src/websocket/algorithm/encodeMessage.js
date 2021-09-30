const encodeMessage = (opcode, payload) => {
    let buf;
    // first byte: fin and opcode
    let b1 = 0x80 | opcode;
    // Second byte: mask and length part 1
    // Followed by o, 2, or 8 additional bytes of continued length
    let b2 = 0;                     // server does not mask frames
    let length = payload.length;
    if (length < 126) {
        buf = new Buffer.alloc(payload.length + 2 + 0);
        // zero extra bytes
        b2 |= length;
        buf.writeUInt8(b1, 0);
        buf.writeUInt8(b2, 1);
        payload.copy(buf, 2);
    } else if (length < (1 << 16)) {
        buf = new Buffer.alloc(payload.length + 2 + 2);
        // two bytes extra
        b2 |= 126;
        buf.writeUInt8(b1, 0);
        buf.writeUInt8(b2, 1);
        // add two byte length
        buf.writeUInt16BE(length, 2);
        payload.copy(buf, 4);
    } else {
        buf = new Buffer.alloc(payload.length + 2 + 8);
        // eight bytes extra
        b2 |= 127;
        buf.writeUInt8(b1, 0);
        buf.writeUInt8(b2, 1);
        // add eight byte length
        // note: this implementation cannot handle lengths greater than 2'32
        // the 32 bit length is prefixed with 0x0000
        buf.writeUInt32BE(0, 2);
        buf.writeUInt32BE(length, 6);
        payload.copy(buf, 10);
    }

    return buf;
}

module.exports = encodeMessage;