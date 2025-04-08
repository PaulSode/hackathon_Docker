const dotenv = require('dotenv')
const { User } = require('../models/users')
const jwt = require('jsonwebtoken')
const redis = require('../config/redis')

// get config vars
dotenv.config()

const  generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET,
        { expiresIn: '7200s' })
}

const verifyToken = async (req) => {
    const authHeader = req.headers.authorization
    if (!authHeader) return null
  
    const token = authHeader.split(" ")[1]
    // console.log(token)
    // Vérifier si le token est dans la liste noire
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)
      return user;
    } catch (err) {
      return null
    }
};

module.exports = { generateAccessToken, verifyToken }