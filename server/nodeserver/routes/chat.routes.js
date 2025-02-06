const express = require("express");
const Chat = require("../models/chat.model");
const Doubt = require("../models/doubt.model");
const router = express.Router();

const io = require("../socket.server");
// User joins the chat
router.post("/join", async (req, res) => {
    try {
        const { doubtId, userId, role } = req.body;

        // Emit join event to WebSocket clients in the doubt room
        io.to(doubtId).emit("join_chat", { doubtId, userId, role });
        if (!doubtId || !userId || !role) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        res.status(200).json({ message: `${role} joined chat`, doubtId });
    } catch (error) {
        console.error("Error in joining chat:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Send a message
router.post("/send", async (req, res) => {
    try {
        const { doubtId, sender, message } = req.body;

        if (!doubtId || !sender || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Save message to MongoDB
        const newMessage = new Chat({ doubtId, sender, message });
        await newMessage.save();

        // Emit message to WebSocket clients in the doubt room
        io.to(doubtId).emit("chat_message", { doubtId, sender, message });

        res.status(200).json({ message: "Message sent successfully", doubtId });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Fetch chat history
router.get("/history/:doubtId", async (req, res) => {
    try {
        const { doubtId } = req.params;
        const messages = await Chat.find({ doubtId }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
