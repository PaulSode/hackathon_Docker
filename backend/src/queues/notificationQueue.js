const Queue = require("bull")
const redis = require("../config/redis")
const { sendNotification } = require('../wsServer')

const notificationQueue = new Queue("notifications", {
  redis: { host: "127.0.0.1", port: 6379 },
});

notificationQueue.process(async (job) => {
  const { recipientId, message } = job.data;
  console.log(`🔔 Envoi notification à ${recipientId}: ${message}`);
  // Logique pour envoyer la notification (par exemple, sauvegarde en DB, push notification, etc.)

  // Émettre la notification en temps réel via WebSockets
  sendNotification(recipientId, message)

  // const sendNotification = async (recipientId, message) => {
  //   await notificationQueue.add({ recipientId, message }, { attempts: 3 });
  // };
});
// Fonction pour ajouter une notification à la file d’attente
const addNotificationToQueue = async (recipientId, message) => {
  await notificationQueue.add({ recipientId, message }, { attempts: 3 });
};

module.exports = { notificationQueue, addNotificationToQueue };
