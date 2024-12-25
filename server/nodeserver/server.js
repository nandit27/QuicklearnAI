const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
    res.send({ message: 'Hello from node server' });
});

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`);
});

