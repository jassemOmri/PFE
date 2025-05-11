
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const app = express();

const http = require("http");
const server = http.createServer(app); // remplace app.listen

app.use(express.json());
app.use(cors());

// Configuration de Multer pour le stockage des images
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRouter");
const vendeurRoutes = require("./routes/vendeurRoutes");
const livreurRoutes = require("./routes/livreurRoutes");
const acheteurRoutes = require("./routes/acheteurRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/admin", adminRoutes);
app.use("/acheteur", acheteurRoutes);
app.use("/vendeur", require("./routes/vendeurRoutes"));
app.use("/api/cart", cartRoutes); 
app.use("/api/vendeurs", vendeurRoutes);



app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Permet d'afficher les images

app.use("/auth", authRoutes);


app.use("/api/payment", paymentRoutes);



app.use("/api", productRoutes);


app.use("/api/livreurs", require("./routes/livreurRoutes"));
app.use("/api/orders", orderRoutes);

const { initSocket } = require("./socketServer");
mongoose.connect("mongodb://127.0.0.1:27017/employee")
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(5000, () => {
      console.log(" Serveur lancé sur http://localhost:5000");
      initSocket(server); // ici la magie
    });
  })
  .catch(err => console.error(" MongoDB Connection Error:", err));