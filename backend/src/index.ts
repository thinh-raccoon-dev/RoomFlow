import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`RoomFlow API running on http://localhost:${PORT}`);
  });
});
