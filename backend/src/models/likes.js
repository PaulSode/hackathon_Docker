const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Joi =  require('joi')
const objectId = require('../utils/joiObjectId')

const likeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tweet: { type: Schema.Types.ObjectId, ref: 'Tweet', required: true, index: true },
},
{
    timestamps: true
})

const Like = mongoose.model('Like', likeSchema)

const likeValidation = Joi.object({
    user: objectId.required()
        .messages({
            'any.required': 'Utilisateur est requis',
            'any.invalid': 'ID d\'utilisateur invalide'
    }),
    tweet: objectId.required()
        .messages({
            'any.required': 'Tweet est requis',
            'any.invalid': 'ID du tweet invalide'
    })
})

module.exports = { Like, likeValidation }