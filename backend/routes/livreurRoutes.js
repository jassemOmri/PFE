const express = require("express");
const { getLivreurs } = require("../controller/livreurController");
const router = express.Router();

router.get("/livreurs", getLivreurs);

module.exports = router;
