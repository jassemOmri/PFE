const mongoose = require("mongoose");
const Order = require("../models/order");
const { notifyClient } = require("../socketServer"); // ✅ Import WebSocket
const Product = require("../models/product");
const Vendeur = require("../models/vendeur");

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

    notifyClient(order.acheteurId.toString(), {
      type: "en cours de livraison",
      message: "Votre commande est maintenant en cours de livraison 🚚",
      orderId: order._id,
    });
    
    await order.save();


    await Order.deleteMany({ _id: { $ne: orderId }, clientName: order.clientName });

    res.json({ message: "Commande assignée avec succès", order });
    console.log("confirm function")
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
exports.getOrdersByAcheteur = async (req, res) => {
  const { acheteurId } = req.params;

  try {
    const orders = await Order.find({ acheteurId });
    console.log("👀 All Orders Acheteur:", orders);

    const final = orders.map(order => ({
      _id: order._id,
      clientName: order.clientName,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt,
      products: order.products.map(p => ({
        productName: p.productName,
        quantity: p.quantity,
        price: p.price,
        status: p.status
      }))
    }));

    res.json(final);
  } catch (err) {
    console.error("❌ Erreur dans getOrdersByAcheteur:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.confirmProductByVendeur = async (req, res) => {
  try {
    const { orderId, vendeurId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    let updated = false;

    // Correction unique avec fallback sur status
    order.products = order.products.map((p) => {
      if (typeof p.status === "undefined") p.status = "en attente";

      console.log(`Produit ${p._id} - Vendeur: ${p.vendeurId} - Status: ${p.status}`);

      if (p.vendeurId.toString() === vendeurId && p.status === "en attente") {
        p.status = "confirmée";
        updated = true;
      }
      return p;
    });

          if (!updated) {
        return res.status(400).json({
          message: `Aucun produit à confirmer pour ce vendeur. Vérifie l'état ou si déjà annulé.`,
        });
      }


    // Mettre à jour le statut de la commande si tous les produits sont confirmés
    if (order.products.every(p => p.status === "confirmée")) {
      order.status = "confirmée";
    }

    await order.save();

    res.json({
      success: true,
      message: "Produit(s) confirmé(s) avec succès.",
      order,
      clientId: order.acheteurId.toString(), // ✅ c’est ça qu’on veut
      clientName: order.clientName,
    });
  } catch (error) {
    console.error("Erreur confirmation produit vendeur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.cancelProductByVendeur = async (req, res) => {
  try {
    const { orderId, vendeurId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    let updated = false;

    // 🎯 نعدلو حالة المنتج فقط
    order.products = order.products.map((p) => {
      if (p.vendeurId.toString() === vendeurId && p.status === "en attente") {
        p.status = "annulée";
        updated = true;
      }
      return p;
    });

    if (!updated) {
      return res.status(400).json({
        message: "Aucun produit à annuler pour ce vendeur ou déjà annulé.",
      });
    }

    // ⛔ إذا كل المنتجات ملغية → الغي الكومند كاملة
    if (order.products.every(p => p.status === "annulée")) {
      order.status = "annulée";
    }

    await order.save();

    res.json({
      success: true,
      message: "Produit annulé avec succès.",
      clientId: order.acheteurId,
      order,
    });
  } catch (error) {
    console.error("Erreur annulation produit vendeur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.getOrdersForLivreur =async (req ,res)=>{


try{
  const {livreurID}= req.params

  const commandes = await Order.find({
    status:"confirmée",
    livreur:null,
  })
  res.json(commandes)

}catch(error){
  console.error("erreur recupére les Orders Pour les livreur");
  res.status(500).json({ message: "Erreur serveur" });

}

}
exports.assignOrderToLivreur=async (res ,req)=>{
try {
  const {orderId ,livreurId}=req.params;

  const order = await Order.findById(orderId)
  console.log(order)
  if (!order){
    return res.status(404).json({messsage:"Commande non trovée"})
  } 
  if (!order.livreur){
    return res.status(400).json({message:"commande déja assignée"})
  }
  order.livreur=livreurId
  order.status="en cours de livraision"

  await order.save()
  res.json({success :true , order})
} catch (error) {
  
}


}
exports.markOrderAsDeLivered =async (res,req)=>{
  try {
    const {orderId}=req.params;

    const order = await Order.findById(orderId);
    if(!order){
      return res.status(404).json({message:"Commande introvable"})
    }
    if(order.status!=="en cours de livraison"){
      return res.status(400).json({message:"Commande Non en cours de livraison"})
    }
    order.status="livrée"
    await order.save()
  notifyClient(order.acheteurId.toString(),{
    type :"delivered",
    message:"Votre Commande a ete Livree avec success",
    orderId:order._id,
  })

    res.json({
      success:true,
      message:"Commande Livree",
      order
    })
     } catch (error) {
    
  }
}
exports.confirmOrderDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    order.status = "livrée";
    await order.save();

    res.json({ message: "Commande livrée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la livraison :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
