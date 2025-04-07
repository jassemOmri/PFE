const express = require("express");
const router = express.Router();
const { addToCart, removeFromCart, getCart,confirmOrder ,clearCartForUser,removeProductFromCart} = require("../controller/cartController"); // ✅ Importez les fonctions du contrôleur

// ✅ Définissez les routes avec les fonctions de rappel
router.post("/add", addToCart); // Utilisez la fonction addToCart
router.post("/remove", removeFromCart); // Utilisez la fonction removeFromCart
router.get("/:acheteurId", getCart); // Utilisez la fonction getCart
router.post("/confirm", confirmOrder);
router.delete("/clear/:acheteurId", clearCartForUser);
router.delete("/remove/:acheteurId/:productId", removeProductFromCart);
module.exports = router;