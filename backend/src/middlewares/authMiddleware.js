const { verifyToken } = require('../services/tokenService');
const { User } = require('../models');

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' })
    }
    
    const token = authHeader.split(' ')[1]
    console.log(token)
  
    const decoded = await verifyToken(token)
    console.log(decoded)
    const user = await User.findById(decoded.id)
    console.log(user)
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' })
    }
    
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    }
    
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré.' })
    }
    
    if (error.message === 'Token is blacklisted') {
      return res.status(401).json({ message: 'Token révoqué. Veuillez vous reconnecter.' })
    }
    
    return res.status(401).json({ message: 'Token invalide.' })
  }
}

const isDebile = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Accès non autorisé. Vous devez vous connecter.' })
  }

  if (req.user.role !== 'debile') {
    return res.status(403).json({ message: 'Accès interdit aux gens intelligent.' })
  }

  next()
}

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Accès non autorisé. Vous devez vous connecter.' })
  }

  if (req.user.role!== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs.' })
  }

  next()
}

module.exports = { authenticateJWT, isDebile, isAdmin }
