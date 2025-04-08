const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Joi = require('joi')
const objectId = require('../utils/joiObjectId')

const commentSchema = new Schema({
    content: { type: String, required: true, maxlength: 280},
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tweet: { type: Schema.Types.ObjectId, ref: 'Tweet', required: true, index: true },
},
{
    timestamps: true
})

const Comment = mongoose.model('Comment', commentSchema)

const commentValidation = Joi.object({
    content: Joi.string().max(280).required()
        .messages({
            'string.base': 'Commentaire doit être une chaîne de caractères',
            'string.empty': 'Commentaire ne peut pas être vide',
            'string.max': 'Commentaire ne peut pas dépasser {#limit} caractères',
            'any.required': 'Commentaire est requis'
    })
    // author: objectId.required()
    //     .messages({
    //         'any.required': 'Auteur est requis',
    //         'any.invalid': 'ID d\'auteur invalide'
    // }),
    // tweet: objectId.required()
    //     .messages({
    //         'any.required': 'Tweet est requis',
    //         'any.invalid': 'ID du tweet invalide'
    // })
})

module.exports = { Comment, commentValidation }