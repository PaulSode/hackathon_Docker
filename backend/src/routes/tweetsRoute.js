const router = require('express').Router()
const tweetController = require('../controllers/tweetController')
const { upload } = require('../utils/uploads')
const { authenticateJWT } = require('../middlewares/authMiddleware')

router.get('/', authenticateJWT, tweetController.getTimeline)
router.post('/', authenticateJWT, upload.single('media'), tweetController.createTweet)
router.delete('/:id', authenticateJWT, tweetController.deleteTweet)
router.post('/:id/comment', authenticateJWT, tweetController.comment)
router.get('/:id', tweetController.getTweet)
router.post('/:id/like', authenticateJWT, tweetController.likeTweet)
router.post('/:id/retweet', authenticateJWT, tweetController.reTweet)
router.get('/all', tweetController.getAllTweets)

module.exports = router