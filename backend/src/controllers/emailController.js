const emailService = require('../services/emailService')
const { User } = require('../models')

const sendVerificationEmail = async (req, res) => {
    try {
        const userId = req.user?.id
        
        if (userId) {
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' })
            }
            
            if (user.isEmailVerified) {
                return res.status(400).json({ message: 'Votre email est déjà vérifié' })
            }
            
            const verificationToken = emailService.generateToken()
            const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
            
            user.verificationToken = verificationToken 
            user.verificationTokenExpires = verificationTokenExpires 
            await user.save()
            
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
            
            await emailService.sendVerificationEmail(user, verificationUrl)
            
            return res.status(200).json({ message: 'Email de vérification renvoyé avec succès' })
        }
        
        const { userId: bodyUserId } = req.body
        
        if (!bodyUserId) {
            return res.status(400).json({ message: 'ID utilisateur requis' })
        }
        
        const user = await User.findById(bodyUserId);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        }
        
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email déjà vérifié' })
        }
        
        const verificationToken = emailService.generateToken()
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        
        user.verificationToken = verificationToken
        user.verificationTokenExpires = verificationTokenExpires
        await user.save()
        
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
        
        await emailService.sendVerificationEmail(user, verificationUrl)
        
        res.status(200).json({ message: 'Email de vérification envoyé' })
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de vérification:', error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        })
        
        if (!user) {
            return res.status(400).json({ message: 'Token de vérification invalide ou expiré' })
        }
        
        user.isEmailVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpires = undefined
        await user.save()
        
        res.status(200).json({ message: 'Email vérifié avec succès' })
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'email:', error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

module.exports = {
    sendVerificationEmail,
    verifyEmail
}