const Cart = require("../models/Cart");
const Product = require("../models/product");
const User = require("../models/User");
const Order = require("../models/order");
const { notifyClient } = require("../socketServer");

exports.addToCart = async (req, res) => {
  try {
    const { acheteurId, productId, quantity } = req.body;
    console.log(req.body)

    if (!acheteurId || !productId) {
      return res.status(400).json({ success: false, message: "acheteurId et productId sont requis" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produit non trouvé" });
    }

    const acheteur = await User.findById(acheteurId);
    if (!acheteur) {
      return res.status(404).json({ success: false, message: "Acheteur non trouvé" });
    }

    let cart = await Cart.findOne({ acheteurId });
    if (!cart) {
      cart = new Cart({ acheteurId, products: [] });
    }

    const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({
        productId: product._id,
        name: product.name,
        price: product.regularPrice, 
        image: product.image,
        vendeurId: product.vendeurId,
        quantity,
      });
    }

    await cart.save();
   
   
notifyClient(acheteurId, {
  type: "cart_updated",
  data: { updated: true },
});

    res.json({ success: true, message: "Produit ajouté au panier", cart });
  } catch (error) {
    console.error("Erreur dans addToCart:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { acheteurId, productId } = req.body;

    let cart = await Cart.findOne({ acheteurId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Panier introuvable" });
    }

    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    await cart.save();

    res.json({ success: true, message: "Produit supprimé du panier", cart });
  } catch (error) {
    console.error("Erreur dans removeFromCart:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};




/*exports.getCart = async (req, res) => {
  try {
    const { acheteurId } = req.params;
    if (!acheteurId) {
      return res.status(400).json({ success: false, message: "acheteurId est requis" });
    }

    const cart = await Cart.findOne({ acheteurId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Panier introuvable" });
    }

    res.json(cart);
  } catch (error) {
    console.error("Erreur dans getCart:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};*/
exports.getCart = async (req, res) => {
  try {
    const { acheteurId } = req.params;
    if (!acheteurId) {
      return res.status(400).json({ success: false, message: "acheteurId est requis" });
    }

    let cart = await Cart.findOne({ acheteurId });

    // ✅ Si le panier n'existe pas, retourne un panier vide
    if (!cart) {
      return res.json({
        acheteurId,
        products: [],
      });
    }

    res.json(cart);
  } catch (error) {
    console.error("Erreur dans getCart:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

exports.confirmOrder = async (req, res) => {
  try {
    console.log("Données reçues :", req.body);

    const { acheteurId, paymentMethod, clientLng, clientLat, clientName, products } = req.body;

    if (!acheteurId || clientLng == null || clientLat == null || !clientName || !products?.length) {
      return res.status(400).json({ success: false, message: "Données manquantes" });
    }

    // ✅ Créer une seule commande avec tous les produits
    const newOrder = new Order({
      acheteurId,
      clientName,
      clientLng,
      clientLat,
      paymentMethod,
      status: "en attente",
      products: products.map((product) => ({
        productId: product.productId,
        productName: product.productName,
        quantity: product.quantity,
        price: product.price, // utilise price déjà calculé dans panier
        vendeurId: product.vendeurId,
      })),
    });

    await newOrder.save();

    res.json({ success: true, message: "Commande enregistrée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la confirmation de la commande:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


exports.clearCartForUser = async (req, res) => {
  try {
    const { acheteurId } = req.params;
    await Cart.findOneAndDelete({ acheteurId });
    res.json({ success: true, message: "Panier vidé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du panier:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};
exports.removeProductFromCart = async (req, res) => {
  const { acheteurId, productId } = req.params;
  try {
    const cart = await Cart.findOne({ acheteurId });
    if (!cart) return res.status(404).json({ message: "Panier introuvable" });

    cart.products = cart.products.filter((item) => item.productId !== productId);
    await cart.save();

    res.json({ success: true, message: "Produit supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

