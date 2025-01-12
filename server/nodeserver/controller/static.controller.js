const express = require('express');
const student = require('../models/student.model');
const teacher = require('../models/teacher.model');
const jwt = require('jsonwebtoken');


async function handlelogin(req, res) {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({ message: 'email, password, role are required' });
    }
    try {
        let user;
        if (role === 'student') {
            user = await student.findOne({ email, password });
        }
        if (role === 'teacher') {
            user = await teacher.findOne({ email, password });
        }
        if (!user) {
            return res.status(400).json({ message: 'invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET);
        res.cookie('authtoken', token, { httpOnly: true });
        res.status(200).json({ message: 'login successful', user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'internal server error' });
    }

}
async function handlelogout(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'logout successful' });
}
async function handleregister(req, res) {
    console.log(req.body);
    const { email, password, role, avatar, username, phone,highestQualification,experience,subject,certification } = req.body;
    if (!email || !password || !role || !username) {
        return res.status(400).json({ message: 'email, password, role, username are required' });
    }
    try {
        let user;
        if (role === 'student') {
            user = await student.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'student already exist' });
            }
            user = await student.create({ email, password, avatar, username, phone });
        }
        if (role === 'teacher') {
            user = await teacher.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'teacher already exist' });
            }
            user = await teacher.create({ email, password, avatar, username, phone,highestQualification,experience,subject,certification });
        }
        if (!user) {
            return res.status(400).json({ message: 'invalid role' });
        }
        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET);
        res.cookie('authtoken', token, { httpOnly: true });
        res.status(201).json({ message: 'student created and logged in', user , token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'internal server error' });
    }
}


module.exports = {
    handlelogin,
    handlelogout,
    handleregister
}