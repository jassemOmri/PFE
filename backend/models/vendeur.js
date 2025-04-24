const mongoose = require("mongoose");

const VendeurSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  numTele: {
    type: String,
    required: false, 
    unique: false,  
  },
  imCin: {
    type: String,
    required: false,
    unique: false,   
  },
  verified: {
    type: Boolean,
    default: false,
  },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },

  status: { type: String, default: "confirmée" }, 
});
module.exports = mongoose.model("Vendeur", VendeurSchema);