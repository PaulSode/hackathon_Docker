const Joi = require('joi');
const mongoose = require('mongoose');

// Extend Joi with a custom ObjectId validator
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid', { message: 'Invalid ObjectId' });
  }
  return value; // Return the value if valid
}, 'ObjectId validation');

module.exports = objectId;