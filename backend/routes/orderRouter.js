const express = require("express");
const { getOrders, confirmOrder ,getOrdersByVendeur,confirmOrderByVendeur,cancelOrderByVendeur} = require("../controller/orderController");
const router = express.Router();

router.get("/", getOrders);
router.put("/:orderId", confirmOrder);
router.get("/by-vendeur/:vendeurId", getOrdersByVendeur);

router.put("/confirm/:orderId", confirmOrderByVendeur);
router.put("/cancel/:orderId", cancelOrderByVendeur);

module.exports = router;
