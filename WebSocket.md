# WebSocket

---

> 不需要任何浏览器插件，即可使用原生标准下的 WebSocket 协议实现全双工双向实时通信。

## 序

**WebSocket** 最早是 HTML5 BOM 规范的一部分，被叫做 **TCPConnection**，如今 WS 已经发展成一个独立的规范。HTTP 1.0 使用的非持续性连接在每次发起请求时都将建立一个 TCP 连接，HTTP 1.1 虽然使用持续性 TCP 连接解决了效率问题，但其**无状态**和**半双工**特性仍为 Web 应用开发带来了一些麻烦。过去，Web 应用的实时通信是通过轮询、HTTP 流化等技术模拟的，这些方案存在诸多问题，而越来越复杂的 Web 应用需要一个更好的解决方案来处理未来以及现在可能出现的实时通信场景。

### 旧方案

目前最多使用的实时通信模拟方案是**轮询（rolling）**，客户端每隔一个周期发送一次请求，模拟一种实时连接。这种方案对于明确的实时数据刷新率来说很有效，一些 Web 端的金融软件会使用该方案。

**长轮询（long rolling）**是另一个模拟实时通信的方案，在这种方案下，服务端会故意延长响应时间，挂起一个请求的响应，直到有信息时才返回，因此也被称为“挂起 GET”或“搁置 POST”。轮询和长轮询的主要问题是没有标准支持，并且始终不是真正实时的。

两种轮询的技术实现代表是 Comet 。**HTTP 流化技术**和长轮询有些类似，同样是服务端有意挂起请求的响应，不断地在一个响应中发送数据，但从不发出完成响应的 TCP 请求，因此该连接会一直保持开启。流化技术可能会导致代理和防火墙缓存，导致传播时延增加。

这些旧技术终归是建立在 HTTP 之上，因此只能是半双工非实时的。

### 什么是 WebSocket

WebSocket 是一种原生的**全双工**、**单套接字**连接。使用 WS 可以让 HTTP 请求变成持续的 WS 或 WS TLS（Transport Layer Security，原称 SSL 安全套接字层），并让多个 HTTP 重用该连接。和 HTTP 1.1 持续连接不同，服务器可以**在消息可用时就发送报文**，而不用等待一个 HTTP 请求。

目前来说，原生 WebSocket 的主要问题是一些老旧浏览器没有实现 HTML5 标准，导致新的标准无法使用。

### 为什么要用 WebSocket

+ WS 使实时通讯更加有效：半双工和无状态必将导致不必要的资源浪费，WS 可以弥补轻量化 HTTP 的一些缺点
+ WS 简化了客户端-服务器通信：Web 中的 HTTP 实现在一些情况下会变得难以维护（页面请求过多且异步关系混乱），WS 提供的面向连接服务可以简化这些过程
+ WS 就是标准：WS 是 Web 标准的一部分，因此不必像旧技术一样担心未来发展的问题
+ WS 就是服务：WS 和套接字一样，是 OSI 七层模型中应用层和运输层的接口，向应用层应用程序提供服务，Web 应用开发人员不必像旧技术一样关心底层实现，在 HTTP 上处理可能的问题
+ HTML5 API 囊括了 WS：HTML5 包括 WS 的 API ，因此只需使用 JavaScript 代码就能使用 WS 的服务
+ 应用正在变得庞大：前后端分离已成必然，Web 应用的体积和服务范围将变得越来越庞大，使用 WS 可以实现过去只能在桌面上实现的实时通讯、文档协作、在线游戏、金融交易等应用

### WebSocket 现状

WebSocket 标准已经被交由 IETF（互联网工程任务组）开发，并在现代浏览器上得到实现，许多服务器应用框架也开始添加 WebSocket 支持 WS 。

**SPDY**（音：speedy）是谷歌开发的一种新型网络协议，这种协议已经在 Chrome、Opera、Firefox 中实现。SPDY 扩充了 HTTP，和 WS 互相补充，同时使用 SPDY 和 WS 是一个不错的选择。不过 SPDY 还不是标准，但是有可能会和 HTTP 2.0 合并最终成为标准。

**WebRTC（Web Real-Time Connection）**，即 Web 实时通信是 W3C 制定的另一项 Web 标准，并且已经在一些浏览器中实现，WebRTC 计划增加一批模式和 WS 类似的 API，在未来可以将 WebRTC 与 WS 一起使用打造流媒体和实时应用。

## 第一部分 WebSocket 协议

在使用 WebSocket API 之前，需要先熟悉 WS 协议内容。WS 标准文档由 RFC 6455 规定，在2011年12月发布。如果对该请求评论文档规定的内容不熟悉，容易在实际开发中遇到问题而束手无策。当然，也可稍后阅读该部分。

### WebSocket 特性

WebSocket 为 Web 应用提供了 TCP 风格的服务，寻址仍然是单向的，服务器可以异步发送数据，但是只有在 WS 连接打开时进行。一台 WS 服务器也可以是 WS 客户端。WS 客户端不能接受不是由其指定的服务器建立的连接。

下方表格对 TCP、WS 和 HTTP 进行了比较：

|   协议   |         TCP         |     HTTP      |    WebSocket     |
| :------: | :-----------------: | :-----------: | :--------------: |
|   寻址   | IP 地址和套接字端口 |      URL      |       URL        |
| 并发传输 |       全双工        |    半双工     |      全双工      |
|   内容   |    字节流报文段     | MIME 消息报文 | 文本或二进制报文 |
| 消息定界 |         否          |      是       |        是        |
| 连接定向 |         是          |      否       |        是        |

可以看出，HTTP 和 WS 都有消息定界特性，因此可以保证分组完整且按顺序到达，而不会出现 TCP 可能出现的消息碎片问题。

### 检查 WebSocket 流量

一般浏览器调试工具的网络工具模块会有一个 WS 分类，其中会显示一个页面发送的 WS 报文数据。也可使用分组嗅探器 Wireshark 进行抓包。

### 协议内容

#### 第一次握手

每个 WebSocket 请求都**始于一个 HTTP 请求**。该 HTTP 请求包含一个**特殊的首部行**：`Upgrade`，表示正在升级为其他协议，使用 WS 时该首部行为：`Upgrade: WebSocket`。

以下是一个用于升级协议的 HTTP GET ：

```http
GET /echo HTTP/1.1
Host: echo.websocket.org
Origin: http: //www.websocket.org
Sec-WebSocket-Key: 7+C600xYybOv2zmJ69RQsw==
Sec-WebSocket-Version: 13
Upgrade: websocket
```

支持 WS 的服务器将返回以下响应：

```http
HTTP/1.1 101 Switching Protocols
Connection: Upgrade
Date: Wed, 20 Jun 2012 03:39:49 GMT
Sec-WebSocket-Accept: fYoqiH14DgI+SylEMwM2sDLzDiO=
Server: Kaazing Gateway
Upgrade: WebSocket
```

这便是 WebSocket **初始握手(opening handshake)**，除非服务器响应带有`Sec-WebSocket-Accept: xxx`和`Upgrade: WebSocket`首部行，否则客户端不会建立 WS 连接。

几个特殊的 HTTP 首部行：

+ Upgrade：请求升级的协议类型
+ Sec-WebSocket-Key：用于安全校验的 Key，避免跨域攻击，只能在 HTTP 中出现一次
+ Sec-WebSocket-Version：WS 版本，RFC 6455 的版本永远是13
+ Sec-WebSocket-Accept：用于客户端校验的 Key，只能在 HTTP 中出现一次
+ Sec-WebSocket-Extensions：可以在 HTTP 中出现多次，该首部行帮助客户端和服务器商定一组连接时使用的协议级扩展内容，类似 cookie
+ Sec-WebSocket-Protocol：该首部行用于告知客户端可以选择的协议类型

#### 计算响应键值

为了完成握手，服务器需要响应一个计算出来的键值，这个响应将证明服务器能够理解 WS 协议，并用于避免 HTTP 哄骗造成服务器意外地升级协议。

**响应函数**从 HTTP 请求的首部行`Sec-WebSocket-Key`的值中获得，根据该函数计算值并在响应的首部行`Sec-WebSocket-Accept`中返回。WS 协议规范给出了一个固定键值后缀：`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`，任何 WS 服务器都需知道该值。下方演示 Node.js 计算响应值：

```js
const crypto = require('crypto');
const KEY_SUFFIX = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const sha1 = crypto.createHash('sha1');

/**
 * 计算 WS 响应键值
 * @param key Sec-WebSocket-Key
 * @return {string} Sec-WebSocket-Accept
 */
const hashWebSocketKey = (key) => {
    sha1.update(key + KEY_SUFFIX, 'ascii');
    return sha1.digest('base64');
};

module.exports = hashWebSocketKey;
```

#### 消息格式

当 WebSocket 连接建立后，客户端和服务器可以在任何时间互发消息，这些消息由一些二进制首部行标记边界。这些首部行还标记另一个单位：**帧（frame）**，这也是分组在链路层中的描述。WebSocket 中可以用帧表示消息，因为一个消息很少超过一帧。

WebSocket 帧头包括：操作码、长度、屏蔽内容、数据。WS 帧化代码需要负责以下操作：

##### 解析操作码

每一个 WS 消息都有一个指示消息载荷类型的**操作码（opcode）**。操作码由帧头**第一个 byte 的后四个 bit 组成**，取数字值：

+ 1：载荷类型为文本
+ 2：载荷类型为二进制
+ 8：载荷类型为关闭，服务器或客户端发送了一个关闭请求
+ 9：ping
+ 10（0xA）：pong

4 bit 理论有16种取值，WS 为之后的扩展预留了剩下的位置。

##### 解析长度

WS 协议使用可变位数来编码帧长度。

+ 0~126 bytes：长度用帧头前两个字节之一表示，一般是第二个字节，第一个字节是操作码
+ 126~216 bytes：将使用额外两个字节表示长度
+ 216 bytes 以上：长度为8字节，保存在帧头第二个字节的后7位

长度字段的126和127被用作特殊信号，表示后方字节依旧是长度编码内容。

##### 解码文本

WS 文本消息使用 UTF-8 编码，是 WS **唯一允许**的信息编码。Node.js 的`toString()`默认使用 UTF-8。

##### 解除屏蔽

一部分帧内容进行了**屏蔽**处理，屏蔽是为了一些不常见的安全原因并改进与现有 HTTP 代理间的兼容性。帧头第二个字节的第一位会表示该帧是否进行了屏蔽处理。如果有屏蔽，所用的掩码会占据帧头扩展长度部分的后四个字节。下方算法使用四个字节的掩码解除对载荷的屏蔽：

```js
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
```

##### 处理多帧消息

帧格式中的 fin 位（最终位）考虑了多帧消息或部分可用消息流化，这些消息可能不连续或者不完整，不完整消息的 fin 为0。多帧消息的最后一帧的 fin 为 1。

#### 关闭握手

当 WebSocket 关闭时，终止连接的端系统可以发送一个数字状态码和一个消息字符串。状态码为16位无符号整数，消息则是 UTF8 字符串。以下是 RFC 6455 规定的状态码：

| 代码 |        描述        |                             情境                             |
| :--: | :----------------: | :----------------------------------------------------------: |
| 1000 |      正常关闭      |                        会话成功时发送                        |
| 1001 |        离开        | 应用程序且不希望再次连接而关闭连接，服务器或客户端进程可能关闭 |
| 1002 |      协议错误      |                   协议错误而关闭连接时发送                   |
| 1003 | 不可接受的数据类型 |                   收到意外的数据类型时发送                   |
| 1004 |        保留        |                                                              |
| 1005 |        保留        |                                                              |
| 1006 |        保留        |                                                              |
| 1007 |      无效数据      |            接收到格式与消息类型不匹配的数据时发送            |
| 1008 |    消息违反政策    |              连接终止方不希望透露关闭信息时发送              |
| 1009 |      消息过大      |   消息过大，应用程序无法处理时发送，帧载荷最大长度为64字节   |
| 1010 |      需要扩展      |            应用程序需要服务器无法协商的扩展时发送            |
| 1011 |      意外情况      |          应用程序由于不可预测原因而需终止连接时发送          |
| 1012 |        保留        |                                                              |
| 1013 |        保留        |                                                              |
| 1014 |        保留        |                                                              |
| 1015 |  TLS 失败（保留）  |                        TLS 失败时发送                        |
| 1016 |        保留        |                                                              |

其他状态码用于特殊用途，RFC 6455 定义了4类状态码：

+ 0~999：无效状态码，不应使用
+ 1000~2999：保留
+ 3000~3999：需要注册，这些状态码用于特定程序，需要在 IANA 注册
+ 4000~4999：私有，在应用中用于特定用途，不会被其他应用理解

#### 子协议

和 WebSocket 一起使用的协议被称为**子协议**，实际上它们可能是单独且更高级的协议，这些协议名称会放在初始的 HTTP 请求的`Sec-WebSocket-Protocol`首部中。

#### 扩展

客户端的第一个 HTTP 请求的`Sec-WebSocket-Extensions`首部行将包含请求的扩展信息。这些**扩展**因为扩展了 WS 协议得名，如对 WS 数据的压缩。

## 第二部分 客户端 WebSocket

现代浏览器实现了 HTML5 BOM 规范，提供了 WebSocket API。WS 将在 HTTP 的 TCP 第一次握手（客户端向服务器发起 TCP 连接请求）时**将 HTTP 协议升级成 WS 协议**，这一工作在 TCP 连接上进行，因此是一种服务。接下来就是使用 WS API 处理 WS 消息了。

WS API 是完全**事件驱动**的，一旦有服务器数据到达或资源要改变状态时，WS API 会自动发送消息。

### WebSocket 构造函数

在使用 WS 前需要实例化 WS 对象。WS 提供了两种连接方案，在 URL 中表现为 scheme 部分的协议类型：ws 和 wss 。ws 是不加密的流量，wss 将通过 TLS 或称之为 SSL 加密流量。

WS 构造函数接收两个参数，必选的 url 和可选的 protocols：

```js
const ws = new WebSocket('ws://www.websocket.org');
```

第一次 WebSocket 握手时，客户端会发送带有协议名称的`Sec-WebSocket-Protocol`首部行，如果服务器有匹配的协议则响应一个带有相同协议名称的首部行，否则关闭连接。这个协议名称就是第二个字符串参数：

```js
const ws = new WebSocket('ws://echo.websocket.org', 'myProtocol');
```

第二个参数还可以是一个数组，其中包含多个协议名。服务器会从数组中选择其认可的协议，可以通过 WS 实例的`protocol`属性查看最终的协议：

```js
const ws = new WebSocket('ws://echo.websocket.org', ['myProtocol','anotherProtocol']);
ws.onopen = ev => console.log(ws.protocol);
```

### WebSocket 事件

WebSocket API 是事件驱动的，只要连接打开就会监听事件。WS 有以下事件：

+ open：当服务器响应 WS 连接请求时，触发该事件
+ message：接收到 WS 消息时触发
+ error：发生错误时触发，错误会导致断开 WS 连接
+ close：WS 连接关闭时触发

#### open

```js
ws.addEventListener('open', () => console.log('ws connected'));
```

#### message

接收消息时，WS 会将消息挂载到一个事件对象上并传递给回调：

```js
ws.addEventListener('message', (e) => console.log('ws incoming message', e.data));
```

WS 还可以处理二进制数据，对应 JavaScript 类型为 Blob 或 ArrayBuffer，通过设置 WS 实例的`binaryType`可以指定需要的类型，默认为 Blob：

```js
ws.binaryType = 'arraybuffer';
```

随后在回调中按照对应类型的处理方式处理事件的`data`属性。

#### error

error 事件在出现响应故障时触发，随后会关闭连接并触发 close 事件：

```js
ws.addEventListener('error', (e) => console.error('ws error', e));
```

#### close

```js
ws.addEventListener('close', () => console.log('ws closed'));
```

### WebSocket 方法

WebSocket 非继承方法有两个：

+ send
+ close

#### send

在 WS 建立一条基于 TCP 的全双工连接后，就可以在连接打开时调用 `send`方法。该方法接收一个字符串或二进制 Blob、ArrayBuffer 类型。如果在连接建立前调用该方法将抛出错误。可以使用`readyState`属性判断是否已经建立连接，或在回调事件中发送消息：

```js
ws.addEventListener('open', () => ws.send('hello websocket'));
```

#### close

`close`方法将关闭 WS 连接，该方法有两个可选参数：状态码和消息。

```js
ws.addEventListener('close', () => ws.close(1000, 'closed normally'));
```

### WebSocket 属性

#### readyState

`readyState`指示 WS 连接状态，值为 WS 常量，只读：

```js
WebSocket.CONNECTING;       // 0，连接进行，但还未建立
WebSocket.OPEN;             // 1，连接已经建立
WebSocket.CLOSING;          // 2，连接正在进行关闭握手
WebSocket.CLOSED;           // 3，连接已经关闭
```

#### bufferedAmount

`bufferedAmount`属性表示已经进入交换缓存队列，但未到达服务器的分组大小（单位字节 byte），只读。利用该特性可以检查分组大小，并控制每秒传输速率，在缓存分组大小超过一定量时暂停发送：

```js
const maxSize = 10240;
ws.addEventListener('open', () => {
    // 每秒检查，只有缓存量小于1kb时发送，否则等待
    setInterval(() => {
        if (ws.bufferedAmount < maxSize) ws.send(data);
    }, 1000);
});
```

#### protocol

`protocol`属性表示实际使用的协议名，只读。

#### url

`url`属性是连接时指定的 url 地址，只读。

#### binaryType

`binaryType`属性可以指定为`'blob'`或`'arraybuffer'`，作为处理二进制消息时挂载到事件对象上的 JavaScript 类型。

#### extensions

`extensions`属性是服务器指定的扩展列表，只读。

### 兼容性

一些老旧浏览器可能不支持 WebSocket API 。首选，应检查`window`对象下的`WebSocket`属性是否存在：

```js
if (window.WebSocket) {
    console.log('The browser supports WS.')
} else {
    console.log('The browser dose not support WS.')
}
```

如果不兼容，通常可以使用实现`polyfill`来引入需要的 JS 功能。网站[Can I use ...](https://caniuse.com/)中可以查询浏览器兼容信息。

### Socket.io-client

Socket.io 还提供了用于客户端浏览器使用的 WS API，该库**必须和 Socket.io 服务器框架同时使用**，两者之间有特定的扩展协议。

#### 在原生中使用

Socket.io 官网提供了一些 CDN 连接用于直接在 html 文件中引入 Socket.io：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.2.0/socket.io.min.js"></script>
```

```html
<script src="https://cdn.jsdelivr.net/npm/socket.io-client@4.2.0/dist/socket.io.min.js"></script>
```

```html
<script src="https://unpkg.com/socket.io-client@4.2.0/dist/socket.io.min.js"></script>
```

Socket.io 也使用事件驱动的 API 模式，在实例化一个 io 对象时，会自动建立 WS 连接：

```html
<script>
    const socket = io('localhost:80');
    
    // 接收消息时的回调
    socket.on('message', (e) => {
        console.log(e);
    });

    // 连接建立时的回调
    socket.on('connect', () => {
        console.log('ok');
        // 客户端 WS 发送了一个 chat-message事件，在服务器端socket.io的该事件回调可以接收到消息
        socket.emit('chat-message', 'from native');
    });
</script>
```

服务端接收`chat-message`事件触发时传递的消息：

```js
io.on('connection', socket => {
    console.log('user connected');

    socket.on('chat-message', (msg) => {
        console.log('incoming message:', msg);		// incoming message: from native
    });
});
```

#### 在框架中使用

在框架中使用和原生基本一致，只需在正确的地方引入 Socket.io 并创建即可。也可创建插件以便在所有单文件组件中使用，如 Vue ：

```js
// io.js
import {io} from 'socket.io-client';

export default {
    install: (app, {connection, options}) => {
        const socket = io(connection, options);
        app.config.globalProperties.$socket = socket;
        app.provide('socket', socket);
    }
}
```

```js
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import SocketIO from './plugins/io';

const app = createApp(App);

app.use(SocketIO, {
    connection: 'ws://localhost:3200',
});

app.mount('#app');
```

```vue
<template>
  <button @click="handleSendMessage">SEND</button>
</template>

<script setup>
// 某个vue文件
import { inject } from "vue";

const socket = inject("socket");

socket.on("connection", (res) => {
  console.log("#connection: ", res);
});

socket.on("connected", (res) => {
  console.log("#connected: ", res);
});

socket.on("message", (res) => {
  console.log("#message: ", res);
});

const handleSendMessage = () => {
  socket.emit("message", "{ text:  '客户端发送的消息'}");
};
</script>
```

#### 已知问题

在使用 Vite 作为脚手架时，Socket.io-client 会无法发出第一次握手时的 HTTP 请求，因此也无法建立 WS 连接，这个问题在 Vite.js 和 Socket.io 的 Github 仓库的 issue 中（[Vite](https://github.com/vitejs/vite/issues/4798)，[Socket.io-client](https://github.com/socketio/socket.io-client/issues/1495)）已经有报告，目前（截至2021年10月1日）的解决方案是在 Vite 配置文件中强制加载一个 Node.js 原生模块：

```js
export default defineConfig({
    resolve:{
        alias:{
            "xmlhttprequest-ssl": "./node_modules/engine.io-client/lib/xmlhttprequest.js"
        }
    }
});
```

## 第三部分 服务器 WebSocket

WebSocket 执行类似套接字的功能，是应用层应用与运输层 TCP 协议的接口。操作系统和运行时不一定有实现 WebSocket 功能，需要手动实现或调用其他现有的编程语言库。本例使用 Node.js 作为运行时介绍 WS 服务器搭建方案。

### Node.js 实现 WebSocket 服务

接下来是一个演示性的例子，使用 Node.js 提供原始 API 实现一个 WebSocket 服务器。这个例子不够健壮，不要将其用于生产环境。Node.js 运行时版本为 14。

#### hashWebSocketKey.js

```js
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
```

#### unmask.js

```js
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
```

#### encodeMessage.js

```js
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
```

#### WebSocketConnetion.js

```js
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
```

#### index.js

```js
const websocket = require('./src/websocket');

websocket.listen(80, 'localhost', (conn) => {
    console.log('connection opened');

    conn.on('data', (opcode, data) => {
        console.log('message:', data);
        conn.send(data);
    });

    conn.on('close', (code, reason) => {
        console.log('connection closed:', code, reason);
    });
});
```

### Socket.io

本例使用 [Socket-IO](https://socket.io/) 作为 Node.js 环境下的 WebSocket 服务器应用框架。

#### 搭建单独的 WS 服务器

```js
const { Server } = require("socket.io");

const io = new Server({ /* options */ });

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

#### 搭建和 HTTP 服务器共存的 WS 服务器

```js
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

#### 与其他 HTTP 框架一起使用

以 express 为例，socket.io 需要在原生 NodeJS HTTP 模块下工作，因此需要对 express 进行包装。此外，监听端口操作也必须在原生模块下进行：

```js
const express = require("app");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
// 包装
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

// 调用原生模块方法，如果调用app.listen会新建一个http服务器
httpServer.listen(3000);
```
