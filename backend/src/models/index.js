const { User, userValidation } = require('./users')
const { Tweet, tweetValidation } = require('./tweets')
const { Comment, commentValidation } = require('./comments')
const { Like, likeValidation } = require('./likes')

module.exports = {
  User, userValidation,
  Tweet, tweetValidation,
  Comment, commentValidation,
  Like, likeValidation
}