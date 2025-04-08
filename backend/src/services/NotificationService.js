const redis = require("../config/redis");

class NotificationService {
  static async addNotification(userId, notification) {
    const key = `notifications:${userId}`;

    const notificationString = JSON.stringify(notification);

    // Store in Redis sorted set with timestamp
    await redis.zadd(key, Date.now(), notificationString);

    // Set expiration to 2 days (172800 seconds)
    await redis.expire(key, 172800);
  }

  static async getNotifications(userId) {
    const key = `notifications:${userId}`;
    const notifications = await redis.zrevrange(key, 0, -1);
    return notifications.map((notif) => JSON.parse(notif));
  }

  static async deleteNotification(userId, notificationId) {
    const key = `notifications:${userId}`;
    const notifications = await redis.zrange(key, 0, -1);
    
    for (let notifString of notifications) {
      let notif = JSON.parse(notifString);
      if (notif.id === notificationId) {
        await redis.zrem(key, notifString);
        break;
      }
    }
  }
}

module.exports = NotificationService;
