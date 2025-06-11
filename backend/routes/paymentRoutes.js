const express = require("express");
const router = express.Router();

const { confirmPayment } = require("../controller/paymentController");

router.post("/confirm", confirmPayment);

module.exports = router;
