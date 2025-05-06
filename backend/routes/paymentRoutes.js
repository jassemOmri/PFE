const express = require("express");
const router = express.Router();

const { confirmPayment } = require("../controller/paymentController");

// ✅ Route de confirmation de paiement
router.post("/confirm", confirmPayment);

module.exports = router;
