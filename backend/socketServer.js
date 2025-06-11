const { Server } = require("socket.io");

let io;
const connectedClients = new Map(); //   Pour faire le lien clientId → socketId

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log(" WebSocket prêt !");

  io.on("connection", (socket) => {
    console.log(" Client connecté :", socket.id);

    socket.on("register_client", (clientId) => {
      connectedClients.set(clientId, socket.id);
      console.log(" Client enregistré :", clientId);
    });
    socket.on("notification", ({ to, ...data }) => {
      console.log(" Notification reçue du vendeur :", data);
      notifyClient(to, {
        ...data,
        type: data.type || "notification", // sécurité si type manquant
      });
    });

    socket.on("disconnect", () => {
      console.log(" Client déconnecté :", socket.id);
      for (const [clientId, sockId] of connectedClients.entries()) {
        if (sockId === socket.id) {
          connectedClients.delete(clientId);
          break;
        }
      }
    });
   
    
  });
}

//  Correction ici : envoyer "order_update"
function notifyClient(clientId, data) {
  const socketId = connectedClients.get(clientId);
  if (socketId && io) {
    io.to(socketId).emit("order_update", data); //  cohérent avec Navbar.jsx
    console.log(" EVENT order_update envoyé à :", clientId);
  } else {
    console.warn(` Aucun socket enregistré pour le clientId : ${clientId}`);
  }
}

module.exports = { initSocket, notifyClient };
