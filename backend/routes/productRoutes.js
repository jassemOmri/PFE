const express = require("express");
const multer = require("multer");
const isAdmin = require("../middlewares/isAdmin");



const { getProducts, addProduct, getProductsByVendeur, deleteProduct,getProductById ,updateProduct,adminAddProduct

} = require("../controller/productController"); // ✅ Importation correcte

const router = express.Router();

// 📌 **Configuration de `multer` pour le stockage des images**



const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 📌 **Routes des produits**

router.get("/products", getProducts); // ✅ Récupérer tous les produits
router.get("/products/vendeur/:vendeurId", getProductsByVendeur); // ✅ Récupérer les produits d'un vendeur spécifique
router.post("/products", upload.single("image"), addProduct); // ✅ Ajouter un produit avec `vendeurId`
router.delete("/products/:id", deleteProduct);
router.get("/products/:id", getProductById); // ✅ Récupérer un produit spécifique
router.put("/products/:id", upload.single("image"), updateProduct);
router.post("/admin-add", upload.single("image"), isAdmin, adminAddProduct);

module.exports = router;
