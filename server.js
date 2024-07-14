import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import cors from 'cors';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {play} from './game/play.js';


const app = express();
const server = createServer(app);
const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'frontend/index.html'));
});

const io = new Server(server);

app.use(express.static('./'));
app.use(cors());

io.on('connection', async (socket) => {
    console.log('A user connected');
    socket.on('startGame', async () => {
        console.log('Starting the game');
        await play(socket);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
