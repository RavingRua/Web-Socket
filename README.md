# Web Socket

关于 RFC 6455 。

## 实例

### 原生

在根目录下运行 npm 安装命令：

```
npm install
```

运行 npm 脚本，开启 node 服务：

```
npm run srv
```

根据命令行输出进入浏览器页面，观察浏览器控制台和 node 命令行输出。

如果要修改内容，对应脚本在 index.html 的 head 部分。

### Vue

本例中使用 Vite 作为脚手架。进入`src/socket-io-client-test`目录，运行 npm 安装命令：

```
npm install
```

启动开发服务器：

```
npm run vite-dev
```

观察浏览器控制台和 node 命令行输出。

如果要修改内容，对应脚本在`src/socket-io-client-test/src/main.js`中。