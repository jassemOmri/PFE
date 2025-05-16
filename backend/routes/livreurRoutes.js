const express = require("express");
const { getLivreurs ,setDisponibilite,getAvailableOrders,acceptOrder,downloadDeliveryExcel,
    getLivreurById,toggleDisponibilite,setCommandeLivree,marquerCommandeCommeLivree,
    getLivreurProfile,updateLivreurProfile,generateDeliveryPDF,toggleVerificationLivreur,
    getAllLivreursWithUser
} = require("../controller/livreurController");

const router = express.Router();
const upload = require("../middlewares/uploadProfile");
router.get("/livreurs", getLivreurs);   
router.get("/get-livreur/:id", getLivreurById);
router.put("/disponible/:id", toggleDisponibilite);
router.put("/disponible/:userId", setDisponibilite);
router.get("/orders/available", getAvailableOrders);
router.post("/orders/accept", acceptOrder);
router.get("/orders/download/:livreurId", downloadDeliveryExcel);
router.put("/:id/livree", setCommandeLivree);

router.put("/orders/:orderId/livree", marquerCommandeCommeLivree);
router.get("/profile/:id", getLivreurProfile);
router.put("/profile/:id",upload.fields([{ name: "imProfile", maxCount: 1 },{ name: "imCin", maxCount: 1 },]),updateLivreurProfile);
router.get("/orders/download-pdf/:livreurId", generateDeliveryPDF);

// ✅ Ajouter dans livreurRoutes.js
router.put("/verify/:id", toggleVerificationLivreur);
router.get("/", getAllLivreursWithUser);
module.exports = router;
