import {createApp} from 'vue'
import App from './App.vue'
import {io} from 'socket.io-client';

const socket = io('localhost:80');

socket.on('connect', () => {
    socket.emit('chat-message', 'from vite');
});

const app = createApp(App);

app.mount('#app');
