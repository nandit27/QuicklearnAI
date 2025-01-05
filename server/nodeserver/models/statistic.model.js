const mongoose = require('mongoose');

const statisticschema = new mongoose.Schema({
    pasturl: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalscore: {
        type: Number,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student', 
        required: true
    }
}, { timestamps: true });

const Statistic = mongoose.model('Statistic', statisticschema);
module.exports = Statistic;
