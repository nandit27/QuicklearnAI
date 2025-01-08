const express = require('express');
const router = express.Router();

const { storestatics, getstatistics } = require('../controller/userstatistics.controller');
const {
    verifyUser
} = require('../middleware/auth.middleware');

router.post('/statistics',verifyUser, storestatics);
router.get('/showhistory', verifyUser, getstatistics);

module.exports = router;    