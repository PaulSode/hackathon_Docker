const { WebSocketServer } = require('ws')
const WebSocket = require('ws')
const http = require('http')

const server = http.createServer();
const wss = new WebSocketServer({ server });

const clients = new Map(); // Stocker les utilisateurs connectés

wss.on("connection", (ws, req) => {
  console.log("Nouvelle connexion WebSocket");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === "register") {
        clients.set(data.userId, ws); // Associer l'ID utilisateur au WebSocket
        console.log(`Utilisateur ${data.userId} enregistré`);
      }
    } catch (error) {
      console.error("Erreur de parsing du message", error);
    }
  });

  ws.on("close", () => {
    clients.forEach((value, key) => {
      if (value === ws) clients.delete(key);
    });
    console.log("Connexion WebSocket fermée");
  });
});

// Démarrer le serveur WebSocket
server.listen(5001, () => {
  console.log("Serveur WebSocket démarré sur le port 5001");
});

// Fonction pour envoyer une notification à un utilisateur
const sendNotification = (userId, message) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: "notification", message }));
  }
};
 module.exports = { wss, sendNotification }