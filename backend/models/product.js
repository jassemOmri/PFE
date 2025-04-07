const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
 
  image: { type: String, required: true },
  description:{type:String,required:true},
  vendeurId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  regularPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
    
    category:{type:String,required:true},
});

module.exports = mongoose.model("Product", productSchema);