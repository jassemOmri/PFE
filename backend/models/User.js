const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
   numTele: {
    type: String, // string pour préserver le 0 au début
    unique: false,
  },
  imProfile: {
    type: String,
  },
   dateNaissance : {
    type: Date,
    default:""
  },
  addPostale: {
    rue: { type: String, default: "" },
    ville: { type: String, default: "" },
    region: { type: String, default: "" },
    pays: { type: String, default: "" },
    codePostal: { type: String, default: "" },
  },
    dateCreation: {
    type: Date,
    default: Date.now,
  },
  role: { type: String, enum: ["livreur", "acheteur", "vendeur"], required: true },
});

module.exports = mongoose.model("User", userSchema);