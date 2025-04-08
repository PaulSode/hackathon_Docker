const express = require('express')
const { authenticateJWT, isAdmin } = require('../middlewares/authMiddleware')
const {
    getAllUsers,
    updateUserRole,
    deleteUser
} = require('../controllers/adminController')

const router = express.Router()

router.use(authenticateJWT, isAdmin)
router.get('/users', getAllUsers)
router.put('/users/role', updateUserRole)
router.delete('/users/:userId', deleteUser)

module.exports = router