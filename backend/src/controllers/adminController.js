const { Tweet, Like, User, Comment } = require('../models')

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password')
        res.status(200).json(users)
    } catch (error) {
        console.log(`Erreur lors de la récupération des utilisateurs : ${error} `)
        res.status(500).json({ message: "Erreur serveur." })
    }
}

const updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body

        if (!userId || !role) {
            return res.status(400).json({ message: "ID utilisateur et rôle requis." })
        }

        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: "Rôle invalide." })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." })
        }

        user.role = role
        await user.save()

        res.status(200).json({ 
            message: "Rôle de l'utilisateur mis à jour.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.log(`Erreur lors de la mise à jour du rôle de l'utilisateur : ${error} `)
        res.status(500).json({ message: "Erreur serveur." })
    }
}

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params
        
        const user = await User.findById(userId)
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        }
        
        if (user.role === 'admin' && req.user.id !== userId) {
            return res.status(403).json({ message: 'Vous ne pouvez pas supprimer un autre administrateur' })
        }
        
        await tokenService.revokeAllUserTokens(userId)
        await User.findByIdAndDelete(userId)
        await Tweet.deleteMany({ author: userId })
        await Like.deleteMany({ user: userId })
        await Comment.deleteMany({ author: userId })
        
        res.status(200).json({ message: 'Utilisateur supprimé avec succès' })
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser
}