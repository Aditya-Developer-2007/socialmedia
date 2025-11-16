const express = require('express');
const router = express.Router();
const Post = require('../models/post.model');
const requireLogin = require('../middleware/reqlogin');

router.post('/createpost', requireLogin, async (req, res) => {
    const { title, body, pic, githubLink, livePreviewLink } = req.body;
    if (!title || !body || !pic) {
        return res.status(422).json({ error: 'Please add title, body, and picture' });
    }

    try {
        const post = new Post({
            title,
            body,
            photo: pic,
            githubLink,
            livePreviewLink,
            postedBy: req.user._id
        });
        await post.save();
        res.status(201).json({ msg: 'Project created successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/allpost', requireLogin, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("postedBy", "_id name username pic")
            .populate("comments.postedBy", "_id name username pic")
            .populate("ratings.postedBy", "_id name") // --- YEH LINE ADD KI HAI ---
            .sort("-createdAt");
        res.status(200).json({ posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/getsubpost', requireLogin, async (req, res) => {
    try {
        const posts = await Post.find({ postedBy: { $in: req.user.following } })
            .populate("postedBy", "_id name username pic")
            .populate("comments.postedBy", "_id name username pic")
            .populate("ratings.postedBy", "_id name") // --- YEH LINE ADD KI HAI ---
            .sort("-createdAt");
        res.json({ posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/mypost', requireLogin, async (req, res) => {
    try {
        const mypost = await Post.find({ postedBy: req.user._id })
            .populate("postedBy", "_id name username pic")
            .populate("comments.postedBy", "_id name username pic") // Just in case
            .populate("ratings.postedBy", "_id name") // --- YEH LINE ADD KI HAI ---
            .sort("-createdAt");
        res.status(200).json({ mypost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.put('/rate', requireLogin, async (req, res) => {
    const { score, postId } = req.body;
    const newRating = {
        score: score,
        postedBy: req.user._id
    };

    try {
        await Post.findByIdAndUpdate(postId, {
            $pull: { ratings: { postedBy: req.user._id } }
        }, { new: true });

        const result = await Post.findByIdAndUpdate(postId, {
            $push: { ratings: newRating }
        }, { new: true })
            .populate("postedBy", "_id name username pic")
            .populate("comments.postedBy", "_id name username pic")
            .populate("ratings.postedBy", "_id name"); // --- YEH LINE ADD KI HAI ---
        
        res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(422).json({ error: err.message });
    }
});

router.put('/comment', requireLogin, async (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    try {
        const result = await Post.findByIdAndUpdate(req.body.postId, {
            $push: { comments: comment }
        }, { new: true })
            .populate("comments.postedBy", "_id name username pic")
            .populate("postedBy", "_id name username pic")
            .populate("ratings.postedBy", "_id name"); // --- YEH LINE ADD KI HAI ---
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        return res.status(422).json({ error: err.message });
    }
})

router.delete('/deletepost/:postId', requireLogin, async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.postId })
            .populate("postedBy", "_id");

        if (!post) {
            return res.status(422).json({ error: "Post not found" });
        }

        if (post.postedBy._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post" });
        }

        await post.deleteOne();
        res.json({ message: "Successfully deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
})

module.exports = router;