const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

// CORS middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Proxy middleware configuration
const proxyOptions = {
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: {
        '^/gen': '' // Remove /gen prefix when forwarding to Flask
    },
    onProxyReq: (proxyReq, req, res) => {
        // Add any necessary headers to the proxied request
        proxyReq.setHeader('origin', 'http://localhost:5000');
    },
    onProxyRes: (proxyRes, req, res) => {
        // Ensure CORS headers are set correctly
        proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    }
};

app.use('/gen', createProxyMiddleware(proxyOptions));

app.listen(port, () => {
    console.log(`Proxy server running on http://localhost:${port}`);
});