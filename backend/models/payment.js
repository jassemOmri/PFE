const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  acheteurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["en ligne", "à la livraison"],
    required: true,
  },
  status: {
    type: String,
    enum: ["succès", "échoué"],
    default: "succès",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
