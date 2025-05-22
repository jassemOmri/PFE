const express = require("express");
const router = express.Router();
const { requestAccountDeactivation } = require("../controller/userController");

//  Désactivation manuelle par l'utilisateur lui-même
router.put("/desactiver/:id", requestAccountDeactivation);

module.exports = router;
