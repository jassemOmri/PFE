const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/product");
const Order = require("../models/order");
const isAdmin = require("../middlewares/isAdmin"); // Importer le middleware


// Récupérer tous les utilisateurs
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Récupérer tous les produits
router.get("/products", isAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Récupérer toutes les commandes
router.get("/orders", isAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Supprimer un utilisateur
router.delete("/users/:userId", isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ success: true, message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Approuver un produit
router.put("/products/:productId/approve", isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { status: "approuvé" },
      { new: true }
    );
    res.json({ success: true, message: "Produit approuvé", product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// routes/adminRoutes.js
router.get("/stats", isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    res.json({
      success: true,
      stats: { totalUsers, totalProducts, totalOrders },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;