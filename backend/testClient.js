const WebSocket = require("ws");

const socket = new WebSocket("ws://localhost:5001");

socket.on("open", () => {
  console.log("✅ Connected to WebSocket server");
  socket.send(JSON.stringify({ type: "register", userId: "user123" }));
});

socket.on("message", (data) => {
  console.log("📩 Message from server:", data.toString());
});

socket.on("error", (err) => {
  console.error("❌ WebSocket error:", err);
});

socket.on("close", () => {
  console.log("❌ Connection closed");
});
