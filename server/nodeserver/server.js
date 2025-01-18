const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const db = require('./connection');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const staticRoutes = require('./routes/static.routes');
const storestatisticRoutes = require('./routes/user.routes');

const morgan = require('morgan');
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send({ message: 'ok' });
});

app.use(morgan("[:date[clf]] :method :url :status :res[content-length] - :response-time ms"));
app.use('/auth', authRoutes);
app.use('/', staticRoutes);
app.use('/user', storestatisticRoutes);

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`);
});