const mongoose = require('mongoose')
const HashtagSchema = new mongoose.Schema(
    {
        tag: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
        tweetCount: {
        type: Number,
        default: 0,
    },
        lastUsedAt: {
        type: Date,
        default: Date.now,
    },
    },
    { timestamps: true }
);

HashtagSchema.index({ tag: 1 });

const Hashtag= mongoose.model("Hashtag", HashtagSchema)

module.exports = Hashtag
  