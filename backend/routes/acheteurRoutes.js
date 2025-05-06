const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadProfile");

const {
  getAcheteurProfile,
  updateAcheteurProfile,
} = require("../controller/acheteurController");

// 🔍 Récupérer le profil acheteur
router.get("/profile/:userId", getAcheteurProfile);

// 🛠️ Mettre à jour le profil (avec image de profil uniquement)
router.put(
  "/profile/:userId",
  upload.single("imProfile"),  // ✅ واحد فقط وليس .fields()
  updateAcheteurProfile
);

module.exports = router;
