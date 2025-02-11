import { io } from 'socket.io-client';

const socket = io('http://localhost:5002', {
  withCredentials: true // This allows sending cookies with requests
});

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5002'],
  credentials: true,
  optionsSuccessStatus: 200
};



export default socket;
