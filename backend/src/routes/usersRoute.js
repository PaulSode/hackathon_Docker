const router = require('express').Router()
const userController = require('../controllers/userController')
const { authenticateJWT } = require('../middlewares/authMiddleware')
const { upload } = require('../middlewares/middleware')
const { getMe } = require('../controllers/authController')

router.post('/signup', upload.single("image"), userController.signUp)
router.post('/:id/follow', authenticateJWT, userController.follow)

router.put('/update', authenticateJWT, upload.single("image"), userController.edit)

router.get('/me', authenticateJWT, getMe)

module.exports = router