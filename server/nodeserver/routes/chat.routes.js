const express = require("express");
const Chat = require("../models/chat.model");
const Doubt = require("../models/doubt.model");
const router = express.Router();
const { joinchat, getChatHistory } = require("../controller/chat.controller");
const io = require("../socket.server");
// User joins the chat
router.post("/join",);

// Send a message
router.post("/send", joinchat);

// Fetch chat history
router.get("/history/:doubtId", getChatHistory);

module.exports = router;
