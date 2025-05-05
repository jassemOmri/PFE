const jwt = require("jsonwebtoken");
const Product = require("../models/product");
const SECRET_KEY = "mysecretkey"

const User = require("../models/User");



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
    const products = await Product.find().populate("vendeurId", "name email"); // on récupère le nom du vendeur
    res.json(products); // ✅ doit retourner un tableau
  } catch (err) {
    console.error("Erreur getProducts:", err);
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
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Produit supprimé" });
  } catch (err) {
    console.error("Erreur suppression produit:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Produit introuvable" });

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.regularPrice = req.body.regularPrice || product.regularPrice;
    product.salePrice = req.body.salePrice || product.salePrice;
    product.category = req.body.category || product.category;

    // Gestion image
    if (req.file) {
      product.image = req.file.filename; // ou req.file.path si cloud
    }

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error("Erreur update product:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
// Utilisée uniquement par l'admin pour ajouter un produit à un vendeur donné via son email

exports.adminAddProduct = async (req, res) => {
  try {
        const {
        name,
        description,
        regularPrice,
        salePrice,
        category,
        email, // correspond à ce que le frontend envoie
      } = req.body;

    const image = req.file ? req.file.filename : null;

    if (!image) {
      return res.status(400).json({ success: false, message: "Image requise" });
    }

    // 🔍 Recherche du vendeur par son email
    const vendeur = await User.findOne({  email, role: "vendeur" });
    if (!vendeur) {
      return res.status(404).json({ success: false, message: "Vendeur introuvable avec cet email" });
    }

    const product = new Product({
      name,
      description,
      regularPrice,
      salePrice,
      category,
      image,
      vendeurId: vendeur._id,
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("❌ Erreur adminAddProduct:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
