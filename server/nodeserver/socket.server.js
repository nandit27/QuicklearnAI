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
        try {
            // Validate input parameters
            if (!roomId || !userId || !role) {
                socket.emit("error", { message: "Missing required parameters" });
                return;
            }

            // Initialize room if it doesn't exist
            if (!quizRooms.has(roomId)) {
                quizRooms.set(roomId, {
                    teacher: null,
                    students: new Set(),
                    scores: new Map(),
                    socketIds: new Map()
                });
            }

            const room = quizRooms.get(roomId);
            if (!room) {
                socket.emit("error", { message: "Failed to create/get room" });
                return;
            }

            // Handle teacher join
            if (role === "teacher") {
                room.teacher = userId;
                room.socketIds.set(userId, socket.id);
            } 
            // Handle student join
            else if (role === "student") {
                // Remove old socket connection if exists
                if (room.socketIds.has(userId)) {
                    const oldSocketId = room.socketIds.get(userId);
                    if (oldSocketId && oldSocketId !== socket.id) {
                        const oldSocket = io.sockets.sockets.get(oldSocketId);
                        if (oldSocket) {
                            oldSocket.leave(roomId);
                        }
                    }
                }

                socket.join(roomId);
                room.students.add(userId);
                room.socketIds.set(userId, socket.id);
                room.scores.set(userId, 0);
            }

            // Emit room update to all clients in the room
            io.to(roomId).emit("room_update", {
                students: Array.from(room.students),
                teacher: room.teacher
            });

            console.log(`${role} ${userId} joined quiz room ${roomId}`);
            console.log(`Current students in room:`, Array.from(room.students));

        } catch (error) {
            console.error("Error joining quiz room:", error);
            socket.emit("error", { message: "Failed to join quiz room" });
        }
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
            room.scores.set(userId, room.scores.get(userId) + 1);
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
        try {
            for (const [roomId, room] of quizRooms.entries()) {
                if (!room || !room.socketIds) continue;

                let userIdToRemove = null;
                
                // Find the user with this socket ID
                for (const [userId, socketId] of room.socketIds.entries()) {
                    if (socketId === socket.id) {
                        userIdToRemove = userId;
                        break;
                    }
                }

                if (userIdToRemove) {
                    // Clean up user data
                    room.students.delete(userIdToRemove);
                    room.socketIds.delete(userIdToRemove);
                    room.scores.delete(userIdToRemove);

                    // Handle teacher disconnect
                    if (room.teacher === userIdToRemove) {
                        room.teacher = null;
                    }

                    // Emit room update
                    io.to(roomId).emit("room_update", {
                        students: Array.from(room.students),
                        teacher: room.teacher
                    });

                    // Clean up empty rooms
                    if (!room.teacher && room.students.size === 0) {
                        quizRooms.delete(roomId);
                        console.log(`Room ${roomId} deleted - no participants left`);
                    }
                }
            }
        } catch (error) {
            console.error("Error handling disconnect:", error);
        }
    });

    socket.on("leave_chat", ({ doubtId, userId }) => {
        socket.leave(doubtId);
        io.to(doubtId).emit("user_left", { userId });
    });

    // Store quiz in Redis when teacher creates it
    socket.on('store_quiz', async ({ roomId, quizData, teacherId }) => {
        try {
            await redis.set(`quiz:${roomId}`, JSON.stringify(quizData), 'EX', 3600); // 1 hour expiry
            socket.join(roomId);
            console.log(`Quiz stored for room ${roomId}`);
        } catch (error) {
            socket.emit('error', { message: 'Failed to store quiz' });
        }
    });

    // Add this after the store_quiz event handler
    socket.on('verify_room', async ({ roomId, userId, role }) => {
        try {
            const exists = await redis.exists(`quiz:${roomId}`);
            if (exists) {
                const quizData = await redis.get(`quiz:${roomId}`);
                const questions = JSON.parse(quizData);
                
                if (role === 'student') {
                    // Add student to room if not already present
                    const room = quizRooms.get(roomId) || { 
                        teacher: null, 
                        students: [], 
                        scores: {} 
                    };
                    
                    if (!room.students.includes(userId)) {
                        room.students.push(userId);
                        room.scores[userId] = 0;
                        quizRooms.set(roomId, room);
                    }
                }
                
                socket.emit('room_verified', { 
                    exists: true, 
                    questions 
                });
            } else {
                socket.emit('room_verified', { exists: false });
            }
        } catch (error) {
            socket.emit('error', { message: 'Failed to verify room' });
        }
    });
});

console.log(`WebSocket server running on port ${socketPort}`);
module.exports = io;
