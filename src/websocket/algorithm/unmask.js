/**
 * 解除掩码屏蔽
 * @param mask_bytes:ArrayBuffer
 * @param buffer:string
 * @return {Buffer}
 */
const unmask = (mask_bytes, buffer) => {
    const payload = new Buffer.alloc(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
        payload[i] = mask_bytes[i % 4] ^ buffer[i];
    }
    return payload;
}

module.exports = unmask;