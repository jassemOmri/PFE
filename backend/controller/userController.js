const User = require("../models/User");
const Order = require("../models/order");
const Product = require("../models/product");
const bcrypt = require("bcryptjs");

//  Fonction interne pour vérifier s’il peut être désactivé
const canDeactivateUser = async (userId, role) => {
  if (role === "acheteur") {
    const hasOrder = await Order.exists({ acheteurId: userId });
    return !hasOrder;
  }

  if (role === "vendeur") {
    const hasOrders = await Order.exists({ "products.vendeurId": userId });
    const hasProducts = await Product.exists({ vendeurId: userId });
    return !hasOrders && !hasProducts;
  }

  if (role === "livreur") {
    const hasDelivered = await Order.exists({ livreur: userId });
    return !hasDelivered;
  }

  return false;
};

//  Fonction appelée par la route PUT /api/users/desactiver/:id
const requestAccountDeactivation = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // 🔐 Vérification mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

    if (!user.isActive) {
      return res.status(400).json({ message: "Ce compte est déjà désactivé." });
    }

    const canDeactivate = await canDeactivateUser(id, user.role);
    if (!canDeactivate) {
      return res.status(400).json({
        message: "Impossible de désactiver ce compte : interactions actives trouvées.",
      });
    }

    user.isActive = false;
    user.dateDesactivation = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Votre compte a été désactivé. Il sera supprimé dans 30 jours.",
    });
  } catch (err) {
    console.error("Erreur désactivation:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


module.exports = {
  requestAccountDeactivation,
};
