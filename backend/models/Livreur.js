const mongoose = require("mongoose");

const LivreurSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  numTele: {
    type: String,
    required: false, // ✅ PAS obligatoire
    unique: false,   // ✅ très important : ne PAS mettre `unique: true` si le champ est vide
  },
  imCin: {
    type: String,
    required: false,
    unique: false,   // ✅ même chose ici
  },
  verified: {
    type: Boolean,
    default: false,
  },
  disponible: {
  type: Boolean,
  default: true, // ✅ par défaut le livreur est disponible
},
});

module.exports = mongoose.model("Livreur", LivreurSchema);
