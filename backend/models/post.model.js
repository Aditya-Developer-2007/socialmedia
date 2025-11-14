const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    githubLink: {
        type: String,
        trim: true,
        default: ""
    },
    livePreviewLink: {
        type: String,
        trim: true,
        default: ""
    },
    photo: {
        type: String,
        required: true,
        trim: true
    },
    ratings: [{
        score: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    comments: [{
        text: {
            type: String,
            required: true,
            trim: true
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('Post', postSchema);