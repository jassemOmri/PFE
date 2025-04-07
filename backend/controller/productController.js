const jwt = require("jsonwebtoken");
const Product = require("../models/product");
const SECRET_KEY = "mysecretkey"




// Obtenir un produit par ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params; // Récupérer l'ID depuis l'URL
    const product = await Product.findById(id); // Chercher le produit dans la BD

    if (!product) {
      return res.status(404).json({ success: false, message: "Produit non trouvé" });
    }

    res.json(product);
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Obtenir tous les produits
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Obtenir les produits d'un vendeur spécifique
exports.getProductsByVendeur = async (req, res) => {
  try {
    const { vendeurId } = req.params;
    const products = await Product.find({ vendeurId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Ajouter un produit
exports.addProduct = async (req, res) => {
  try {
   
    // Récupérez le token depuis les en-têtes de la requête
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Token non fourni" });
    }
     console.log("🛠️ البيانات المستلمة:", req.body); // ✅ تحقق من البيانات
      console.log("📸 الملفات المستلمة:", req.files);
    // Décodez le token pour récupérer les informations de l'utilisateur
    const decoded = jwt.verify(token, SECRET_KEY);
    const vendeurId = decoded.userId; // Récupérez l'ID du vendeur depuis le token

    // Récupérez les données du produit depuis le corps de la requête
    const { name,description ,regularPrice,salePrice,category} = req.body;
    const image = req.file ? req.file.filename : null;
        console.log("🛠️ Body reçu:", req.body);
        console.log("📸 Fichier reçu:", req.file);

    // Vérifiez que vendeurId est présent
    if (!vendeurId) {
      return res.status(400).json({ success: false, message: "vendeurId est requis" });
    }

    // Vérifiez que l'image est présente
    if (!image) {
      return res.status(400).json({ success: false, message: "L'image est requise" });
    }

    // Créez un nouveau produit
    const newProduct = new Product({ name,image, vendeurId, description,regularPrice,salePrice,category });
    await newProduct.save();

    // Répondez avec le produit créé
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Erreur dans addProduct:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Produit non trouvé" });
    }

    res.json({ success: true, message: "Produit supprimé avec succès", productId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};