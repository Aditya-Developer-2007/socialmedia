const express = require('express');
const router = express.Router();
const Post = require('../models/post.model');
const requireLogin = require('../middleware/reqlogin');

router.post('/createpost', requireLogin, async (req, res) => {
    const {title, body, pic} = req.body;
    if (!title || !body || !pic) {
        return res.status(422).json({ error: 'Please add all the fields' });
    }
    const post = new Post({
        title,
        body,
        photo: pic,
        postedBy: req.user._id
    });
    await post.save()
    res.status(201).json({ msg: 'Post created successfully' });
})

router.post('/mypost', requireLogin, async (req, res) => {
    try {
        const posts = await Post.find({ postedBy: req.user._id })
        res.status(200).json({mypost:posts});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/getsubpost',requireLogin,(req,res) =>{
    Post.find({postedBy:{$in:req.user.following}})
        .populate("postedBy","_id name")
        .populate("comments.postedBy","_id name")        
        .then(posts =>{
            res.json({posts})
        })
        .catch(err =>{
            console.log(err)
        })
})

router.get('/allpost', requireLogin, async (req, res) => {
    try {
        const posts = await Post.find()
        res.status(200).json({allPosts:posts});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
    })

router.put('/like', requireLogin, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.body.postId, {
            $push: { likes: req.user._id }
        }, { new: true })
        res.status(200).json({ post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/unlike', requireLogin, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.body.postId, {
            $pull: { likes: req.user._id }
        }, { new: true })
        res.status(200).json({ post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.put('/comment', requireLogin, async (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    const result = await Post.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, { new: true })
    res.status(200).json({ post: result });
})

router.delete('/deletepost/:postId', requireLogin, async (req, res) => {
    const result = await Post.findOne({_id:req.params.postId});
    if(result.postedBy.toString() === req.user._id.toString()) {
        await Post.findByIdAndDelete(req.params.postId); 
    }
    return res.status(200).json({ msg: 'Post deleted successfully' });
})

module.exports = router;