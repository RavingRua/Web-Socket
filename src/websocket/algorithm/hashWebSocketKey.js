const crypto = require('crypto');
const KEY_SUFFIX = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

/**
 * 计算 WS 响应键值
 * @param key:string Sec-WebSocket-Key
 * @return {string} Sec-WebSocket-Accept
 */
const hashWebSocketKey = (key) => {
    const sha1 = crypto.createHash('sha1');
    sha1.update(key + KEY_SUFFIX, 'ascii');
    const res = sha1.digest('base64');
    // console.log(res);
    return res;
};

module.exports = hashWebSocketKey;