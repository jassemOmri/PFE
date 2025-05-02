// routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,toggleUserActivation
} = require("../controller/adminController");
const isAdmin = require("../middlewares/isAdmin");

// 🔹 Route pour récupérer tous les utilisateurs
router.get("/users", getAllUsers);

// 🔹 Route pour créer un nouvel utilisateur
router.post("/create-user", createUser);

// 🔹 Route pour modifier un utilisateur
router.put("/update-user", isAdmin, updateUser);

// 🔹 Route pour supprimer un utilisateur
router.delete("/delete-user/:id", deleteUser);
router.put("/toggle-user/:id", isAdmin, toggleUserActivation);

module.exports = router;
