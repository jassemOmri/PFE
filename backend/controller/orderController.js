const mongoose = require("mongoose");
const Order = require("../models/order");
const { notifyClient } = require("../socketServer"); // ✅ Import WebSocket

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ livreur: null });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.confirmOrder = async (req, res) => {
  const { livreurId } = req.body;
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Commande non trouvée" });

    order.livreur = livreurId;
    order.status = "en cours de livraison";
    await order.save();

    await Order.deleteMany({ _id: { $ne: orderId }, clientName: order.clientName });

    res.json({ message: "Commande assignée avec succès", order });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getOrdersByVendeur = async (req, res) => {
  try {
    const { vendeurId } = req.params;
    const vendeurObjectId = new mongoose.Types.ObjectId(vendeurId);

    const orders = await Order.find({ "products.vendeurId": vendeurObjectId });

    const filtered = orders.map((order) => {
      const produitsDuVendeur = order.products.filter(
        (p) => p.vendeurId.toString() === vendeurId
      );
      return {
        _id: order._id,
        clientName: order.clientName,
        status: order.status,
        products: produitsDuVendeur,
      };
    });

    res.json(filtered);
  } catch (err) {
    console.error("Erreur serveur vendeur commandes :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.confirmOrderByVendeur = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Commande non trouvée" });

    order.status = "confirmée";
    await order.save();

    // ✅ Envoi d'une notification au client
    notifyClient(order.acheteurId.toString(), {
      type: "confirmation",
      message: `Votre commande a été confirmée par le vendeur.`,
      orderId: order._id,
    });

    res.json({
      success: true,
      message: "Commande confirmée",
      clientId: order.acheteurId,
    });
  } catch (error) {
    console.error("Erreur lors de la confirmation :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.cancelOrderByVendeur = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Commande non trouvée" });

    order.status = "annulée";
    await order.save();

    // ❌ Envoi d'une notification au client
    notifyClient(order.acheteurId.toString(), {
      type: "annulation",
      message: `Votre commande a été annulée par le vendeur.`,
      orderId: order._id,
    });

    res.json({
      success: true,
      message: "Commande annulée",
      clientId: order.acheteurId,
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
