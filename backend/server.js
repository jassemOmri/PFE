const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // pour socket.io

// ✅ Autoriser les credentials (cookies, headers) entre localhost:5173 et localhost:5000
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// ⬇️ Multer config
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ⬇️ Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRouter");
const adminRoutes = require("./routes/adminRoutes");
const livreurRoutes = require("./routes/livreurRoutes");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/livreur", orderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", livreurRoutes);

// ⬇️ MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/employee")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ✅ SOCKET.IO avec CORS complet
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
    credentials: true
  }
});

// 🧠 Logique WebSocket côté serveur
io.on("connection", (socket) => {
  console.log("🟢 Client connecté :", socket.id);

  socket.on("register_client", (clientId) => {
    socket.join(clientId); // join la room du client
  });

  // Tu pourras envoyer depuis ton backend :
  // io.to(clientId).emit("order_update", { message: "...", ... })

  socket.on("disconnect", () => {
    console.log("🔴 Client déconnecté");
  });
});

// ⬇️ Démarrer serveur HTTP + Socket
/// hi
server.listen(5000, () => console.log("🚀 Serveur lancé sur http://localhost:5000"));
