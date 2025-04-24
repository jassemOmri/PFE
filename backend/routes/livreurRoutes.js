const express = require("express");
const { getLivreurs ,setDisponibilite,getAvailableOrders,acceptOrder,downloadDeliveryExcel,getLivreurById,toggleDisponibilite} = require("../controller/livreurController");
const router = express.Router();

router.get("/livreurs", getLivreurs);   
router.get("/:id", getLivreurById); 
router.put("/disponible/:id", toggleDisponibilite);
router.put("/disponible/:userId", setDisponibilite);
router.get("/orders/available", getAvailableOrders);
router.post("/orders/accept", acceptOrder);
router.get("/orders/download/:livreurId", downloadDeliveryExcel);

module.exports = router;
