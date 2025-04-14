const express = require("express");
const router = express.Router();
const { getVendeurProfile,updateVendeurProfile } = require("../controller/vendeurController");
const upload = require("../middlewares/uploadProfile");
router.put(
  "/profile/:userId",
  upload.fields([
    { name: "imProfile", maxCount: 1 },
    { name: "imCin", maxCount: 1 },
  ]),
  updateVendeurProfile
);
// ➕ Route pour afficher le profil vendeur avec ses produits
router.get("/profile/:userId", getVendeurProfile);
router.put("/profile/:userId", updateVendeurProfile);

module.exports = router;
