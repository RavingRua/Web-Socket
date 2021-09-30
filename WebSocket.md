# WebSocket

---

## 序

不需要任何浏览器插件，即可使用原生标准下的 WebSocket 协议实现全双工双向实时通信。

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

## WebSocket 协议

在使用 WebSocket API 之前，需要先熟悉 WS 协议内容。

## 客户端 WebSocket

现代浏览器实现了 HTML5 BOM 规范，提供了 WebSocket API。WS 将在 HTTP 的 TCP 第一次握手（客户端向服务器发起 TCP 连接请求）时**将 HTTP 协议升级成 WS 协议**，这一工作在 TCP 连接上进行，因此是一种服务。接下来就是使用 WS API 处理 WS 消息了。

WS API 是完全**事件驱动**的，一旦有服务器数据到达或资源要改变状态时，WS API 会自动发送消息。

### WebSocket API 入门

#### WebSocket 构造函数

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

#### WebSocket 事件

WebSocket API 是事件驱动的，只要连接打开就会监听事件。WS 有以下事件：

+ open：当服务器响应 WS 连接请求时，触发该事件
+ message：接收到 WS 消息时触发
+ error：发生错误时触发，错误会导致断开 WS 连接
+ close：WS 连接关闭时触发

##### open

```js
ws.addEventListener('open', () => console.log('ws connected'));
```

##### message

接收消息时，WS 会将消息挂载到一个事件对象上并传递给回调：

```js
ws.addEventListener('message', (e) => console.log('ws incoming message', e.data));
```

WS 还可以处理二进制数据，对应 JavaScript 类型为 Blob 或 ArrayBuffer，通过设置 WS 实例的`binaryType`可以指定需要的类型，默认为 Blob：

```js
ws.binaryType = 'arraybuffer';
```

随后在回调中按照对应类型的处理方式处理事件的`data`属性。

##### error

error 事件在出现响应故障时触发，随后会关闭连接并触发 close 事件：

```js
ws.addEventListener('error', (e) => console.error('ws error', e));
```

##### close

```js
ws.addEventListener('close', () => console.log('ws closed'));
```

#### WebSocket 方法

WebSocket 非继承方法有两个：

+ send
+ close

##### send

在 WS 建立一条基于 TCP 的全双工连接后，就可以在连接打开时调用 `send`方法。该方法接收一个字符串或二进制 Blob、ArrayBuffer 类型。如果在连接建立前调用该方法将抛出错误。可以使用`readyState`属性判断是否已经建立连接，或在回调事件中发送消息：

```js
ws.addEventListener('open', () => ws.send('hello websocket'));
```

##### close

`close`方法将关闭 WS 连接，该方法有两个可选参数：状态码和消息。

```js
ws.addEventListener('close', () => ws.close(1000, 'closed normally'));
```

#### WebSocket 属性

##### readyState

`readyState`指示 WS 连接状态，值为 WS 常量，只读：

```js
WebSocket.CONNECTING;       // 0，连接进行，但还未建立
WebSocket.OPEN;             // 1，连接已经建立
WebSocket.CLOSING;          // 2，连接正在进行关闭握手
WebSocket.CLOSED;           // 3，连接已经关闭
```

##### bufferedAmount

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

##### protocol

`protocol`属性表示实际使用的协议名，只读。

##### url

`url`属性是连接时指定的 url 地址，只读。

##### binaryType

`binaryType`属性可以指定为`'blob'`或`'arraybuffer'`，作为处理二进制消息时挂载到事件对象上的 JavaScript 类型。

##### extensions

`extensions`属性是服务器指定的扩展列表，只读。

#### 兼容性

一些老旧浏览器可能不支持 WebSocket API 。首选，应检查`window`对象下的`WebSocket`属性是否存在：

```js
if (window.WebSocket) {
    console.log('The browser supports WS.')
} else {
    console.log('The browser dose not support WS.')
}
```

如果不兼容，通常可以使用实现`polyfill`来引入需要的 JS 功能。网站[Can I use ...](https://caniuse.com/)中可以查询浏览器兼容信息。

## 服务器 WebSocket

WebSocket 执行类似套接字的功能，是应用层应用与运输层 TCP 协议的接口。操作系统和运行时不一定有实现 WebSocket 功能，需要手动实现或调用其他现有的编程语言库。本例使用 Node.js 作为运行时介绍 WS 服务器搭建方案。

### Node.js 实现 WebSocket 服务



### Socket.io

本例使用 [Socket-IO](https://socket.io/) 作为 NodeJS 环境下的 WebSocket 服务器应用框架。

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

