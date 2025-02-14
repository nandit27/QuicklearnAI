const { Server } = require("socket.io");
const Chat = require("./models/chat.model");
const Doubt = require("./models/doubt.model");
const redis = require("./redis.connection");

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
// Track quiz rooms and states
const quizRooms = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle joining chat room
    socket.on("join_chat", async ({ doubtId, userId, role }) => {
        try {
            console.log(doubtId, userId, role);
            const doubt = await Doubt.findById(doubtId);
            if (!doubt) {
                socket.emit("error", { message: "Doubt not found" });
                return;
            }

            const hasPermission = role === 'student' ? 
                doubt.student.toString() === userId :
                doubt.assignedTeacher?.toString() === userId;

            if (!hasPermission) {
                socket.emit("error", { message: "Unauthorized access" });
                return;
            }

            socket.join(doubtId);
            activeUsers.set(userId, { socketId: socket.id, doubtId, role });
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
            const newMessage = new Chat({ doubtId, sender, message });
            await newMessage.save();

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

    // Handle quiz-related events
    socket.on("join_quiz_room", ({ roomId, userId, role }) => {
        if (!quizRooms.has(roomId)) {
            quizRooms.set(roomId, { teacher: null, students: [], scores: {} });
        }
        const room = quizRooms.get(roomId);

        if (role === "teacher") {
            room.teacher = userId;
        } else if (role === "student") {
            room.students.push(userId);
            room.scores[userId] = 0;
        }

        socket.join(roomId);
        io.to(roomId).emit("room_update", { 
            students: room.students, 
            teacher: room.teacher 
        });
        console.log(`${role} ${userId} joined quiz room ${roomId}`);
    });

    // Start Quiz
    socket.on("start_quiz", async ({ roomId }) => {
        const room = quizRooms.get(roomId);
        if (!room || !room.teacher) return;

        try {
            const data = await redis.get(roomId);
            if (data) {
                io.to(roomId).emit("quiz_questions", JSON.parse(data));
            } else {
                socket.emit("error", { message: "No quiz found in Redis" });
            }
        } catch (error) {
            console.error("Error fetching quiz:", error);
            socket.emit("error", { message: "Failed to fetch quiz" });
        }
    });

    // Submit Answer
    socket.on("submit_answer", ({ roomId, userId, question, selectedOption }) => {
        const room = quizRooms.get(roomId);
        if (!room) return;

        const correctAnswer = question.answer;
        if (selectedOption === correctAnswer) {
            room.scores[userId] += 1;
        }

        io.to(roomId).emit("update_scores", { scores: room.scores });
    });

    // End Quiz & Store Statistics in Redis
    socket.on("quiz_end", async ({ roomId }) => {
        const room = quizRooms.get(roomId);
        if (!room) return;

        try {
            const resultData = {
                roomId,
                students: room.students,
                scores: room.scores,
                endedAt: new Date().toISOString()
            };

            await redis.set(roomId, JSON.stringify(resultData), "EX",3600); // Store for 1 hour

            io.to(roomId).emit("final_scores", { scores: room.scores });
            console.log(`Quiz results stored in Redis for room ${roomId}`);

            quizRooms.delete(roomId); // Cleanup memory
        } catch (error) {
            console.error("Error storing quiz results:", error);
            socket.emit("error", { message: "Failed to store quiz results" });
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

        for (const [roomId, room] of quizRooms.entries()) {
            room.students = room.students.filter(s => s !== socket.id);
            if (room.teacher === socket.id) room.teacher = null;

            io.to(roomId).emit("room_update", { 
                students: room.students, 
                teacher: room.teacher 
            });

            if (!room.teacher && room.students.length === 0) {
                quizRooms.delete(roomId);
            }
        }
    });

    socket.on("leave_chat", ({ doubtId, userId }) => {
        socket.leave(doubtId);
        io.to(doubtId).emit("user_left", { userId });
    });
});

console.log(`WebSocket server running on port ${socketPort}`);
module.exports = io;
