const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const db = require('./connection');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const staticRoutes = require('./routes/static.routes');
const storestatisticRoutes = require('./routes/user.routes');

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin']
  }));

app.get('/', (req, res) => {
    res.send({ message: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/', staticRoutes);
app.use('/user', storestatisticRoutes);

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`);
});