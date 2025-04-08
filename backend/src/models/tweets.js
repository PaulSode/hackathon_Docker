const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Joi = require('joi')
const objectId = require('../utils/joiObjectId')

const tweetSchema = new Schema({
        content: { type: String, required: true, maxlength: 280, index: true },
        media: { type: String },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        originalTweet: { type: Schema.Types.ObjectId, ref: 'Tweet'},
        isRetweet: { type: Boolean, default: false, index: true },
        likes: [{ type: Schema.Types.ObjectId, ref: 'Like' }],
        comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
        retweets: [{ type: Schema.Types.ObjectId, ref: 'Tweet' }],
        mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
        hashtags: [{ type: String, lowercase: true, index: true }]
    },
    {
        timestamps: true
    })

tweetSchema.index({ createdAt: -1 })

const Tweet = mongoose.model('Tweet', tweetSchema)

const tweetValidation = Joi.object({
    content: Joi.string().max(280).required()
        .messages({
            'string.base': 'Contenu doit être une chaîne de caractères',
            'string.empty': 'Contenu ne peut pas être vide',
            'string.max': 'Contenu ne peut pas dépasser {#limit} caractères',
            'any.required': 'Contenu est requis'
    }),
    hashtags: Joi.array().items(Joi.string().trim().max(50)) // Ajout de hashtags
        .messages({
            'array.base': 'Hashtags doit être un tableau',
            'string.base': 'Chaque hashtag doit être une chaîne de caractères',
            'string.max': 'Chaque hashtag ne peut pas dépasser {#limit} caractères'
        }),
    mentions: Joi.array().items(objectId) // Validation des mentions comme des ObjectId
        .messages({
            'array.base': 'Mentions doit être un tableau d\'ID utilisateur'
        }),
    media: Joi.string().optional() // Permettre une URL de média optionnelle
})
module.exports = { Tweet, tweetValidation }
