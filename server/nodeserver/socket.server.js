const { Server } = require("socket.io");
const Chat = require("./models/chat.model");

const socketPort = process.env.SOCKET_PORT || 5002;
const io = new Server(socketPort, {
    cors: { origin: "*" }
});

const activeChats = {}; // Store active chat users

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // When teacher or student joins the chat
    socket.on("join_chat", ({ doubtId, userId, role }) => {
        activeChats[userId] = socket.id;
        socket.join(doubtId); // Join room based on doubtId
        console.log(`${role} (${userId}) joined chat for doubt: ${doubtId}`);
    });
    socket.on("new_doubt", async ({ doubtId, student, topic }) => {
        // Find an available teacher (this is just a placeholder logic)
        const assignedTeacher = Object.keys(activeChats).find(userId => activeChats[userId] && userId.startsWith('teacher'));
        console.log("in new doubt", assignedTeacher);
        if (assignedTeacher) {
            // Emit new doubt to the assigned teacher
            io.to(activeChats[assignedTeacher]).emit("new_doubt", {
                doubtId,
                student,
                topic
            });
            console.log(`New doubt ${doubtId} from student ${student} assigned to teacher ${assignedTeacher}`);
        } else {
            console.log(`No available teacher for doubt ${doubtId} from student ${student}`);
        }
    });
    // When a message is sent
    socket.on("chat_message", async ({ doubtId, sender, message }) => {
        if (!doubtId || !sender || !message) return;

        // Save message to MongoDB
        const newMessage = new Chat({ doubtId, sender, message });
        await newMessage.save();

        // Emit message to all users in the chat room
        io.to(doubtId).emit("chat_message", { doubtId, sender, message });
        console.log(`Message sent in doubt ${doubtId}: ${message}`);
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        Object.keys(activeChats).forEach((userId) => {
            if (activeChats[userId] === socket.id) {
                delete activeChats[userId];
                console.log(`User ${userId} disconnected`);
            }
        });
    });
});

console.log(`WebSocket server running on port ${socketPort}`);
module.exports = io;
