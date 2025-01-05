const mongoose = require('mongoose');

const teacherschema = new mongoose.Schema({
    avatar: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    highestQualification: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    subject: {
        type: [String],
        required: true
    },
    certification: {
        type: [String], 
        required: true
    }
}, { timestamps: true });

const teacher = mongoose.model('teacher', teacherschema);
module.exports = teacher;
