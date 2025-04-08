const bcrypt = require('bcryptjs')
const { Tweet, Like, Comment, User, userValidation } = require('../models')
const tokenService = require('../services/tokenService')
const emailService = require('../services/emailService')

const register = async (req, res) => {
    try {
        const { error, value } = userValidation.validate(req.body)
        if (error) {
            return res.status(400).json({ message: error.details[0].message })
        }

        const { username, email, password } = value
        
        const userExists = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (userExists) {
            return res.status(400).json({ 
                message: 'Cet email ou nom d\'utilisateur est déjà utilisé.' 
            });
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const verificationToken = emailService.generateToken()
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

        const profile_img = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null
        let baseHandle = req.body.username.toLowerCase().replace(/\s+/g, '_')
        let handle = baseHandle;
        let count = 1;

        while (await User.findOne({ handle: handle })) {
            handle = `${baseHandle}${count++}`;
        }
        
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            bio: '',
            profile_img,
            banniere_img: null,
            followers: [],
            bookmarks: [],
            verificationToken,
            verificationTokenExpires,
            isEmailVerified: false,
            handle
        })

        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`

        try {
            await emailService.sendVerificationEmail(newUser, verificationUrl)
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError)
        }
        
        res.status(201).json({
            message: 'Utilisateur créé avec succès. Veuillez vérifier votre email.',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePicture: newUser.profile_img,
                isEmailVerified: newUser.isEmailVerified
            }
        })
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error)
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' })
        }
        
        const user = await User.findOne({ email });
        console.log(user)
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({ 
                message: 'Veuillez vérifier votre adresse email avant de vous connecter',
                verificationRequired: true,
                userId: user._id
            });
        }
        
        const { accessToken, refreshToken } = await tokenService.generateTokens(user)
        
        res.status(200).json({
        message: 'Connexion réussie',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profile_img,
            isEmailVerified: user.isEmailVerified
        },
        tokens: {
            accessToken,
            refreshToken
        }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error)
        res.status(500).json({ message: 'Erreur serveur lors de la connexion' })
    }
}

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        console.log(token)
        await tokenService.blacklistToken(token)
        
        await tokenService.revokeAllUserTokens(req.user.id)
        
        res.status(200).json({ message: 'Déconnexion réussie' })
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
        res.status(500).json({ message: 'Erreur serveur lors de la déconnexion' })
    }
}

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        }
        
        res.status(200).json({
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profile_img,
            bannerPicture: user.banniere_img,
            bio: user.bio,
            followers: user.followers.length,
            following: user.following ? user.following.length : 0,
            createdAt: user.createdAt,
            isEmailVerified: user.isEmailVerified,
        }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body
        
        if (!refreshToken) {
            return res.status(400).json({ message: 'Token de rafraîchissement manquant' })
        }
        
        const newAccessToken = await tokenService.refreshAccessToken(refreshToken)
        
        res.status(200).json({
            accessToken: newAccessToken
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token de rafraîchissement expiré, reconnexion nécessaire' })
        }
        
        if (error.message === 'Invalid refresh token') {
            return res.status(401).json({ message: 'Token de rafraîchissement invalide ou révoqué' })
        }
        
        console.error('Erreur lors du rafraîchissement du token:', error)
        res.status(401).json({ message: 'Token de rafraîchissement invalide' })
    }
}

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id
        
        const user = await User.findById(userId)
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        }
        
        try {
            const token = req.headers.authorization.split(' ')[1]
            await tokenService.blacklistToken(token)
        } catch (tokenError) {
            console.error('Erreur lors de la mise en liste noire du token:', tokenError)
        }
        
        try {
            await tokenService.revokeAllUserTokens(userId)
        } catch (revokeError) {
            console.error('Erreur lors de la révocation des tokens:', revokeError)
        }
        
        await User.findByIdAndDelete(userId)
        await Tweet.deleteMany({ author: userId })
        await Like.deleteMany({ user: userId })
        await Comment.deleteMany({ author: userId })
        
        res.status(200).json({ message: 'Compte supprimé avec succès' })
    } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error)
        res.status(500).json({ message: 'Erreur serveur lors de la suppression du compte' })
    }
}

module.exports = {
    register,
    login,
    logout,
    getMe,
    refreshToken,
    deleteAccount
}