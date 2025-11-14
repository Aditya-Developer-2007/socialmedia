const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Post = require('../models/post.model');
const requireLogin = require('../middleware/reqlogin');

// User Profile Route (No Change)
router.get('/user/:id', requireLogin, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const posts = await Post.find({ postedBy: req.params.id })
            .populate("postedBy", "_id name username pic")
            .populate("comments.postedBy", "_id name username pic")
            .sort("-createdAt");

        return res.status(200).json({ user, posts });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Follow Route (No Change)
router.put('/follow', requireLogin, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.body.followId, {
            $push: { followers: req.user._id }
        }, { new: true });

        const updatedCurrentUser = await User.findByIdAndUpdate(req.user._id, {
            $push: { following: req.body.followId }
        }, { new: true }).select("-password"); 

        return res.status(200).json(updatedCurrentUser);

    } catch (err) {
        console.error(err);
        return res.status(422).json({ error: err.message });
    }
});

// Unfollow Route (No Change)
router.put('/unfollow', requireLogin, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.body.unfollowId, {
            $pull: { followers: req.user._id }
        }, { new: true });

        const updatedCurrentUser = await User.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body.unfollowId }
        }, { new: true }).select("-password"); 

        return res.status(200).json(updatedCurrentUser);

    } catch (err) {
        console.error(err);
        return res.status(422).json({ error: err.message });
    }
});

// Search Route (No Change)
router.post('/search-all', requireLogin, async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.json({ users: [], posts: [] });
    }

    try {
        let pattern = new RegExp("^" + query, "i"); 

        const users = await User.find({
            $or: [
                { name: { $regex: pattern } },
                { username: { $regex: pattern } }
            ]
        }).select("_id name username pic");

        const posts = await Post.find({ title: { $regex: pattern } })
            .select("_id title postedBy")
            .populate("postedBy", "_id username"); 

        res.json({ users, posts });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// --- NAYA EDIT PROFILE ROUTE ---
router.put('/update-profile', requireLogin, async (req, res) => {
    const { name, username, course, semester } = req.body;
    
    // Validation
    if (!name || !username || !course || !semester) {
        return res.status(422).json({ error: "Please fill all required fields" });
    }

    try {
        // Check karo ki naya username pehle se kisi aur ka toh nahi hai
        const existingUser = await User.findOne({ username: username });
        if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
            return res.status(422).json({ error: "Username is already taken" });
        }

        // User ko update karo
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, // User ki ID (jo login hai)
            {
                $set: {
                    name: name,
                    username: username,
                    course: course,
                    semester: semester
                }
            },
            { new: true } // Taaki yeh updated user ko waapis return kare
        ).select("-password"); // Password mat bhejna

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Frontend ko naya, updated user object bhejo
        res.json(updatedUser);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;