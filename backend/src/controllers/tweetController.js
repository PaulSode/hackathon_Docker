const { notificationQueue, addNotificationToQueue } = require('../queues/notificationQueue')
const { Tweet, tweetValidation } = require('../models/tweets')
const redis = require('../config/redis')
const { wss } = require('../wsServer')
const mediaQueue = require('../queues/mediaQueue')
const ObjectId = require('mongoose').Types.ObjectId
const { Comment, commentValidation } = require('../models/comments')
const { Like } = require('../models/likes')
const { User } = require('../models/users')

class tweetController {
    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static async createTweet (req, res) {
        try {
            // Convertir hashtags en tableau s'il est envoyé sous forme de chaîne
            req.body.hashtags = Array.isArray(req.body.hashtags)
            ? req.body.hashtags
            : req.body.hashtags
            ? req.body.hashtags.split(',').map(tag => tag.trim())
            : []
            const { error, value } = tweetValidation.validate(req.body)
            if (error) {
              return res.status(400).json({ message: error.details[0].message })
            }
            console.log(value)
            const { content, mentions, hashtags } = req.body;
            console.log(req.user)
            const author = req.user.id;
            let mediaUrl = null;
        
            if (req.file) {
              mediaUrl = `/uploads/${req.file.filename}`;
        
              // Ajouter le média à la file d’attente Bull
              await mediaQueue.add({ filePath: mediaUrl });
            }
        
            const tweet = new Tweet({
              content,
              media: mediaUrl,
              author,
              mentions,
              hashtags: hashtags ? hashtags.map((tag) => tag.toLowerCase()) : [],
            });
            await tweet.save();
        
            // Notification WebSocket pour les abonnés
            const payload = JSON.stringify({
              type: "NEW_TWEET",
              tweetId: tweet._id,
              content: tweet.content,
              author: author,
            });
        
            wss.clients.forEach((client) => client.send(payload));
        
            res.status(201).json(tweet);
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur lors de la création du tweet" });
          }
    }

    static async likeTweet (req, res) {
      try {
        //récupère l'id du tweet depuis l'url et enlève les espaces
        const tweetId = req.params.id.trim();
        //récupère l'id de l'utilisateur authentifié
        const userId = req.user.id
        console.log(req.user)
        //vérifier que le tweet existe
        const tweet = await Tweet.findById(tweetId).select('likes author');;
        if (!tweet) return res.status(404).json({ error: "Tweet non trouvé" });

        /// Vérifier si l'utilisateur a déjà liké ce tweet
        const existingLike = await Like.findOne({ user: userId, tweet: tweetId });
        if (existingLike) {
          // Si déjà liké, retirer le like (dislike)
          await Like.deleteOne({ _id: existingLike._id });
          tweet.likes = tweet.likes.filter(id => id.toString() !== userId);
          await tweet.save();
          return res.json({ success: true, liked: false, likes: tweet.likes.length })

        }
      
        // Ajouter le like
        const newLike = new Like({ user: userId, tweet: tweetId })
        await newLike.save()

        tweet.likes.push(userId)
        await tweet.save()
        // Ajouter une notification dans la file Bull
        // await sendNotification(tweet.author.toString(), `${user.username} a liké votre tweet!`);
        const message = `${req.user.username} a liké votre tweet!`
        await addNotificationToQueue(tweet.author.toString(), message)

        return res.json({ success: true, liked: true, likes: tweet.likes.length })

      } catch(error) {
        return res.status(500).json({ error: "Erreur interne du serveur" })
      }

    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static async reTweet (req, res) {
      // recuperer l'id du tweet de l''url et enlever espaces
      const tweetId = req.params.id.trim()
      // recuperer les infos de l'utilisateur authentifier
      const user = req.user
      console.log(user)

      //vérifier que le tweet existe
      const tweet = await Tweet.findById(tweetId)
      console.log(tweet)
      if (!tweet) return res.status(404).json({ error: "Tweet non trouvé" });

      try {
        const reTweet = new Tweet({
          content: tweet.content,
          media: tweet.media,
          author: user.id,
          originalTweet: tweet._id,
          isRetweet: true,
          mentions: tweet.mentions,
          likes: [],
          comments: [],
          retweets: [],
          hashtags: tweet.hashtags
        })
        await reTweet.save(); // Sauvegarde du retweet

        // Ajouter le retweet à la liste des retweets de l'original
        tweet.retweets.push(reTweet._id);
        await tweet.save(); // Sauvegarde du tweet original

        return res.status(201).json(reTweet);
      } catch(error) {
        return res.status(500).json({ error: "Erreur interne du serveur" });
      }


    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */

    static async getAllTweets (req, res) {
      const tweets = await Tweet.find()
      res.status(200).json(tweets);
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static async deleteTweet(req, res) {
      // res.json({ msg: "del"})
      const id = req.params.id.trim()
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
      try {
        // check tweet exist
          let tweet = await Tweet.findById(id)
          if (!tweet){
              return res.status(404).json({message: `Aucun tweet associé à l'id ${id}`})
          }
          // verifier que user est bien l'auteur du tweet
          const user_id = req.user.id
          if (user_id != tweet.author) {
            return res.status(400).json({ message: "Vous n'etes pas autorise a supprimer ce tweet"})
          }
          // Delete the associated image file if it exists
          if (tweet.media) {
            const imagePath = path.join(__dirname, '..', 'uploads', path.basename(tweet.media));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
          }

          tweet = await Tweet.deleteOne({_id: id})
          res.status(200).json({ message: 'Tweet deleted successfully' }); 
      } catch(error) {
          console.error('Error fetching tweet:', error);
          res.status(500).json({ message: 'Internal server error' });
      }
    }

    static async comment(req, res) {
      // res.json({ msg: "del"})
      const id = req.params.id.trim()
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      try {
        
           // Vérifier si le tweet existe
          const tweet = await Tweet.findById(id).populate("author", "username");
          if (!tweet) {
            return res.status(404).json({ message: `Aucun tweet associé à l'id ${id}` });
          }
          const { error, value } = commentValidation.validate(req.body)

          if (error) {
            return res.json({ message: error.details[0].message})
          }

          // recup l'id de l'auteur du commentaire
          const author = req.user.id
          const newComment = new Comment({
            content: req.body.content,
            author,
            tweet: id
          })

          tweet.comments.push(newComment._id)
          await newComment.save()
          await tweet.save()

          // Ajouter une notification dans la file Bull
          if (tweet.author._id.toString() !== author) {
            const message = `${req.user.username} a commenté votre tweet.`;
            await addNotificationToQueue(tweet.author._id.toString(), message);
          }
          return res.status(200).json(newComment)
          
      } catch(error) {
          console.error('Error fetching tweet:', error);
          res.status(500).json({ message: 'Internal server error' });
      }
    }

     /**
     * 
     * @param {*} req 
     * @param {*} res 
     */

    static async getTweet (req, res) {
      const tweets = await Tweet.find()
      res.status(200).json(tweets)
    }


    static async getTimeline(req, res) {
      try {
        const userId = req.user.id;
    
        // Récupérer les utilisateurs suivis
        const user = await User.findById(userId).select('followings bookmarks');
        if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    
        // Récupérer les tweets des utilisateurs suivis
        const followedTweets = await Tweet.find({ author: { $in: user.followings } })
          .populate('author', 'username profile_img')
          .sort({ createdAt: -1 }) // Trier du plus récent au plus ancien
          .limit(50);
    
        // Récupérer les tweets likés et retweetés par l'utilisateur
        const likedAndRetweetedTweets = await Like.find({ user: userId })
          .populate({
            path: 'tweet',
            populate: { path: 'author', select: 'username profile_img' }
          })
          .sort({ createdAt: -1 })
          .limit(50);
    
        // Récupérer les tweets contenant les hashtags les plus consultés
        const trendingHashtags = await Tweet.aggregate([
          { $unwind: "$hashtags" },
          { $group: { _id: "$hashtags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]);
    
        const tweetsWithTrendingHashtags = await Tweet.find({
          hashtags: { $in: trendingHashtags.map(tag => tag._id) }
        })
          .populate('author', 'username profile_img')
          .sort({ engagementScore: -1 }) // Trier par engagement global
          .limit(50);
    
        // Fusionner tous les tweets et les trier par date et engagement
        const timelineTweets = [...followedTweets, ...likedAndRetweetedTweets.map(like => like.tweet), ...tweetsWithTrendingHashtags];
    
        // Supprimer les doublons et trier par engagement (likes + retweets)
        const uniqueTweets = Array.from(new Map(timelineTweets.map(tweet => [tweet._id.toString(), tweet])).values())
          .sort((a, b) => (b.likes.length + b.retweets.length) - (a.likes.length + a.retweets.length));
    
        res.json({ success: true, tweets: uniqueTweets });
    
      } catch (error) {
        console.error("Erreur Timeline:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
      }
    }
}

module.exports = tweetController