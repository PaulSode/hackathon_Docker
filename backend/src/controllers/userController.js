const { User, userValidation } = require("../models/users")
const { Tweet } = require('../models/tweets')
const ObjectId = require('mongoose').Types.ObjectId
const bcrypt = require('bcryptjs')
const { addNotificationToQueue } = require('../queues/notificationQueue')

class userController {
    /**
     * obtenir la liste de tous les utilisateurs
     * @param {*} req 
     * @param {*} res 
     */
    static async getAll(req, res) {
            // console.log("before request")
            const users = await User.find()
            console.log(users)

            res.status(200).json(users).send()
    }

    /**
     * obtenir les infos sur le profile
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */

    static async getMe(req, res) {
        const id = req.params.id.trim()
        console.log(id)
        if (!ObjectId.isValid(id)) {
            return res.status(401).send("Id invalide")
        }
        const user = await User.findOne({ _id: id })
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" })
        }
        console.log(user)

        res.status(200).json(user).send()
    }
    /**
     * creer un utilisateur
     * @param {*} req 
     * @param {*} res 
     */
    static async signUp(req, res) {
        try {
            console.log(req.body)
            const { error, value } = userValidation.validate(req.body)
            if (error) {
                return res.status(400).json({ message: error.details[0].message})
            }
            let user = await User.findOne({ email: req.body.email })
            if (user) {
                return res.status(400).json({ message: "Email already used" })
            }
            user = await User.findOne({ username: req.body.username })
            if (user) {
                return res.status(400).json({ message: "Username already used" })
            }
             // Hachage du mot de passe avec bcrypt (10 rounds de sel)
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)

            // Gerer image upload
            const profile_img = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null
            // Générer un handle unique
            let baseHandle = req.body.username.toLowerCase().replace(/\s+/g, '_'); // Convertir en minuscule et remplacer les espaces
            let uniqueHandle = baseHandle;
            let count = 1;

            // Vérifier l'unicité du handle
            while (await User.findOne({ handle: uniqueHandle })) {
                uniqueHandle = `${baseHandle}${count++}`;
            }
            const newUser = new User({
              username: req.body.username,
              email: req.body.email,
              password: hashedPassword,
              profile_img,
              handle: uniqueHandle // Assigner le handle généré
            });
            await newUser.save()
            res.status(201).send(newUser)

        } catch(error) {
            console.error('Error signing up:', error);
            res.status(500).json({ message: 'Internal server error' });
        }

    }

    static async bookmarkTweet(req, res) {
        try {
          const userId = req.user.id;
          const { tweetId } = req.params;
      
          // Vérifier si le tweet existe
          const tweet = await Tweet.findById(tweetId);
          if (!tweet) return res.status(404).json({ error: "Tweet non trouvé" });
      
          // Récupérer l'utilisateur
          const user = await User.findById(userId);
      
          // Vérifier si le tweet est déjà enregistré
          const isBookmarked = user.bookmarks.includes(tweetId);
          if (isBookmarked) {
            user.bookmarks = user.bookmarks.filter(id => id.toString() !== tweetId);
          } else {
            user.bookmarks.push(tweetId);
          }
      
          await user.save();
          res.json({ success: true, bookmarks: user.bookmarks });
      
        } catch (error) {
          console.error("Erreur Signet:", error);
          res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }

    static async follow(req, res) {
        try {
            const userId = req.user.id; // L'utilisateur authentifié
            const targetId = req.params.id.trim() // L'utilisateur à suivre/désuivre
        
            if (userId === targetId) {
              return res.status(400).json({ error: "Vous ne pouvez pas vous suivre vous-même." })
            }
        
            const user = await User.findById(userId)
            const targetUser = await User.findById(targetId)
        
            if (!targetUser) {
              return res.status(404).json({ error: "Utilisateur introuvable." })
            }
        
            const alreadyFollowing = user.followings.includes(targetId)
        
            if (alreadyFollowing) {
              // Unfollow : retirer de la liste
              user.followings = user.followings.filter(id => id.toString() !== targetId)
              targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId)
            } else {
                // Follow : ajouter à la liste
                user.followings.push(targetId)
                targetUser.followers.push(userId)
                // ✅ Ajouter une notification pour l'utilisateur suivi
                const message = `${user.username} vous suit maintenant!`
                await addNotificationToQueue(targetUser._id.toString(), message)
            }
        
            await user.save();
            await targetUser.save();
        
            res.json({
              success: true,
              following: !alreadyFollowing,
              followersCount: targetUser.followers.length
            });
        
          } catch (error) {
            console.error("Erreur Follow:", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
          }
    }

    static async userTimeline(req, res) {

    }

    static async edit(req, res) {
        try {
            console.log(req.user);
            // Check if user is authenticated
            if (!req.user) {
                console.error('Authentication error: req.user or req.user.id is undefined', {
                    user: req.user,
                    headers: req.headers
                });
                return res.status(401).json({ message: "Authentication failed - user not identified" });
            }

            // Get user ID from authenticated request
            const userId = req.user.id;
            console.log('Processing update for user ID:', userId);

            // Extract data from request
            const { bio } = req.body;
            console.log('Update payload:', { bio, hasFile: !!req.file });

            // Handle image upload
            const profile_img = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

            // Find the user by ID
            let user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Update fields if provided
            if (bio !== undefined) user.bio = bio;
            if (profile_img) user.profile_img = profile_img;

            if (!user.handle && user.username) {
                user.handle = user.username.toLowerCase().replace(/\s+/g, '_');
            }

            // Save changes
            await user.save();

            // Return updated user
            res.status(200).json({
                message: "Profile updated successfully",
                user
            });
        } catch (error) {
            console.error('Error editing profile:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}

module.exports = userController