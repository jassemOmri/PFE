const express = require("express");
const { getLivreurs ,setDisponibilite} = require("../controller/livreurController");
const router = express.Router();

router.get("/livreurs", getLivreurs);
router.put("/disponibilite/:userId", setDisponibilite);
module.exports = router;
