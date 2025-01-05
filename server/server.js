const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const cors = require('cors')
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');

const port = process.env.PORT || 3000;

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions))

app.use('/gen', createProxyMiddleware({ target: 'http://localhost:5000', changeOrigin: true }));
app.use('/user', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`);
});