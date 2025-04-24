const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  acheteurId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ تأكد من أن `acheteurId` مرتبط بـ `User`
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: String,
      price: Number,
      image: String,
      vendeurId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      quantity: { type: Number, default: 1 },
          status: { type: String, default: "en attente" }, 
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
