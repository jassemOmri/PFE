const express = require("express");
const { getOrders, confirmOrder ,getOrdersByVendeur,
        confirmOrderByVendeur,cancelOrderByVendeur,
        getOrdersByAcheteur,confirmProductByVendeur,cancelProductByVendeur,
        getOrdersForLivreur,confirmOrderDelivery
    } = require("../controller/orderController");
const router = express.Router();

router.get("/", getOrders);
router.put("/:orderId", confirmOrder);
router.get("/by-vendeur/:vendeurId", getOrdersByVendeur);

router.put("/confirm/:orderId", confirmOrderByVendeur);
router.put("/cancel/:orderId", cancelOrderByVendeur);
router.get("/acheteur/:acheteurId", getOrdersByAcheteur);
router.put("/confirm-product/:orderId/:vendeurId", confirmProductByVendeur);
router.put("/cancel/:orderId/:vendeurId", cancelProductByVendeur);

router.get("/livreur/:livreurId",getOrdersForLivreur);

// orderRoutes.js
router.put("/confirm-delivery/:orderId", confirmOrderDelivery);


module.exports = router;
