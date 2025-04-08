const express = require('express')
const { authenticateJWT } = require('../middlewares/authMiddleware')
const {
    register,
    login,
    logout,
    getMe,
    refreshToken,
    deleteAccount
} = require('../controllers/authController')
const {forgotPassword, resetPassword } = require('../controllers/passwordController')
const { verifyEmail, sendVerificationEmail } = require('../controllers/emailController')
const { upload } = require('../middlewares/middleware')

const router = express.Router()

router.post('/register', upload.single("image"), register)
router.post('/login', login)
router.post('/refresh-token', refreshToken)
router.get('/verify-email/:token', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/resend-verification-email', sendVerificationEmail)

router.post('/logout', authenticateJWT, logout)
router.get('/me', authenticateJWT, getMe)
router.delete('/delete', authenticateJWT, deleteAccount)

module.exports = router;