const express = require("express");
const router = express.Router();
const {
  addToCart,
  removeProductFromCart,
  getCart,
  confirmOrder,
  clearCartForUser
} = require("../controller/cartController");

// ✅ Routes correctes
router.post("/add", addToCart);
router.get("/:acheteurId", getCart);
router.post("/confirm", confirmOrder);
router.delete("/clear/:acheteurId", clearCartForUser);

// ✅ SUPPRESSION DU PRODUIT PAR DELETE
router.delete("/remove/:acheteurId/:productId", removeProductFromCart);

module.exports = router;
