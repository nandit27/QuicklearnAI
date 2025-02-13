const { Server } = require("socket.io");
const Chat = require("./models/chat.model");
const cors = require('cors');
const Doubt = require("./models/doubt.model");

const socketPort = process.env.SOCKET_PORT || 5002;
const io = new Server(socketPort, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true,
        optionsSuccessStatus: 200
    }
});

// Track active users and their rooms
const activeUsers = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle joining chat room
    socket.on("join_chat", async ({ doubtId, userId, role }) => {
        try {
            // Verify doubt exists and user has permission
            console.log(doubtId,userId,role);
            
            const doubt = await Doubt.findById(doubtId);
            if (!doubt) {
                socket.emit("error", { message: "Doubt not found" });
                return;
            }

            // Verify user has permission
            const hasPermission = role === 'student' ? 
                doubt.student.toString() === userId :
                doubt.assignedTeacher?.toString() === userId;

            if (!hasPermission) {
                socket.emit("error", { message: "Unauthorized access" });
                return;
            }

            // Join the room
            socket.join(doubtId);
            activeUsers.set(userId, {
                socketId: socket.id,
                doubtId,
                role
            });

            socket.emit("joined_chat", { doubtId });
            console.log(`${role} ${userId} joined chat ${doubtId}`);
        } catch (error) {
            console.error("Error joining chat:", error);
            socket.emit("error", { message: "Failed to join chat" });
        }
    });

    // Handle chat messages
    socket.on("send_message", async ({ doubtId, sender, message }) => {
        try {
            // Save message to database
            const newMessage = new Chat({ doubtId, sender, message });
            await newMessage.save();

            // Broadcast to room
            io.to(doubtId).emit("chat_message", {
                doubtId,
                sender,
                message,
                timestamp: new Date()
            });
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        for (const [userId, data] of activeUsers.entries()) {
            if (data.socketId === socket.id) {
                activeUsers.delete(userId);
                break;
            }
        }
    });

    socket.on('leave_chat', ({ doubtId, userId }) => {
        socket.leave(doubtId);
        io.to(doubtId).emit('user_left', { userId });
    });
});

console.log(`WebSocket server running on port ${socketPort}`);
module.exports = io;
