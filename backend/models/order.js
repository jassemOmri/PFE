const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  acheteurId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clientName: { type: String, required: true },
  clientLat: { type: Number, required: true },
  clientLng: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: "en attente" },
  livreur: { type: mongoose.Schema.Types.ObjectId, ref: "Livreur", default: null },

  // ✅ Liste de produits dans la commande
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      productName: String,
      quantity: Number,
      price: Number,
      vendeurId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    }
  ]
});

module.exports = mongoose.model("Order", orderSchema);
