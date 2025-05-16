const Cart = require("../models/Cart");
const Product = require("../models/product");
const User = require("../models/User");
const Order = require("../models/order");
const { notifyClient } = require("../socketServer");
const Vendeur = require("../models/vendeur");

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
    } else { // creer un nouvelle produit  dans la panier , parceque la phinomane de snapshot ou en france copie figée
              // si vendeur veux changer la prix de la produit , dans la panier n'est change pas la prix
      cart.products.push({
        productId: product._id,
        name: product.name,
        price: product.regularPrice, 
        image: product.image,
        vendeurId: product.vendeurId,
        quantity,
        status: "en attente",
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

exports.removeProductFromCart = async (req, res) => {
  const { acheteurId, productId } = req.params;

  try {
    const cart = await Cart.findOne({ acheteurId });
    if (!cart) return res.status(404).json({ message: "Panier non trouvé." });

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    res.status(200).json({ message: "Produit supprimé du panier.", cart });
  } catch (err) {
    console.error("Erreur suppression produit:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


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
//Création de la commande


exports.confirmOrder = async (req, res) => {
  try {
    console.log("Données reçues :", req.body);

    const { acheteurId, paymentMethod, clientLng, clientLat, clientName, products } = req.body;

    if (!acheteurId || clientLng == null || clientLat == null || !clientName || !products?.length) {
      return res.status(400).json({ success: false, message: "Données manquantes" });
    }

    // 🔁 Construction complète des produits avec coordonnées vendeur
    // 1. Grouper les produits par vendeurId
const groupedByVendeur = {};
for (let item of products) {
  const productData = await Product.findById(item.productId);
  const vendeurId = productData.vendeurId.toString();

  if (!groupedByVendeur[vendeurId]) {
    groupedByVendeur[vendeurId] = [];
  }

  groupedByVendeur[vendeurId].push({
    ...item,
    productData,
  });
}
for (const vendeurId in groupedByVendeur) {
  const vendeurInfo = await Vendeur.findOne({ user: vendeurId });

  const produitsDuVendeur = groupedByVendeur[vendeurId].map((item) => ({
    productId: item.productId,
    productName: item.productData.name,
    quantity: item.quantity,
    price: item.productData.salePrice || item.productData.regularPrice || 0,
    vendeurId: vendeurId,
    vendeurLat: vendeurInfo?.lat || 0,
    vendeurLng: vendeurInfo?.lng || 0,
    status: "en attente",
  }));

  const newOrder = new Order({
    acheteurId,
    clientName,
    clientLat,
    clientLng,
    paymentMethod,
    status: "en attente",
    products: produitsDuVendeur,
  });

  await newOrder.save();
 
 

}


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

