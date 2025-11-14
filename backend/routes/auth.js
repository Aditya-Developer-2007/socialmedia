const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const requireLogin = require('../middleware/reqlogin');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    // 1. course aur semester ko req.body se liya
    const { name, email, password, pic, username, course, semester } = req.body;

    // 2. Validation mein add kiya
    if (!name || !email || !password || !username || !course || !semester) {
        return res.status(422).json({ error: 'Please add all the fields' });
    }
    try {
        const savedUserByEmail = await userModel.findOne({ email: email })
        if (savedUserByEmail) {
            return res.status(422).json({ error: 'User already exists with that email' });
        }

        const savedUserByUsername = await userModel.findOne({ username: username })
        if (savedUserByUsername) {
            return res.status(422).json({ error: 'Username is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        // 3. Naye user object mein save kiya
        const user = new userModel({
            name,
            email,
            username,
            password: hashedPassword,
            pic,
            course,
            semester
        });
        await user.save();
        res.status(201).json({ msg: 'User created successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }

})

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: 'Please add email and password' });
    }

    try {
        const savedUser = await userModel.findOne({ email });
        if (!savedUser) {
            return res.status(422).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, savedUser.password);
        if (!isMatch) {
            return res.status(422).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: savedUser._id }, "aaaaaaaaaa", { expiresIn: '1d' });

        // 4. Login ke time course aur semester ko bhi frontend par bheja
        const { _id, name, username, followers, following, pic, email: userEmail, course, semester } = savedUser;
        return res.status(200).json({ token, user: { _id, name, email: userEmail, username, followers, following, pic, course, semester } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router;