const Vendeur = require("../models/vendeur");
const User = require("../models/User");
const Product = require("../models/product");

// 🔍 Récupérer les infos du profil vendeur
exports.getVendeurProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupérer les données de l'utilisateur
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });

    // Récupérer les données vendeur
    const vendeur = await Vendeur.findOne({ user: userId });
    if (!vendeur) return res.status(404).json({ success: false, message: "Profil vendeur non trouvé" });

    // Récupérer les produits du vendeur
    const products = await Product.find({ vendeurId: userId });

    res.json({
      success: true,
      user,
      vendeur,
      products,
    });
  } catch (error) {
    console.error("❌ Erreur récupération profil vendeur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
exports.updateVendeurProfile = async (req, res) => {
  try {
    const { userId } = req.params;

   const { numTele, dateNaissance, addPostale, lat, lng } = req.body;


    let addPostaleParsed = addPostale;
    if (typeof addPostale === "string") {
      addPostaleParsed = JSON.parse(addPostale); // en cas de FormData
    }

    const imProfile = req.files?.imProfile?.[0]?.filename;
    const imCin = req.files?.imCin?.[0]?.filename;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        numTele,
        dateNaissance,
        addPostale: addPostaleParsed,
        ...(imProfile && { imProfile }),
      },
      { new: true }
    );

      const updatedVendeur = await Vendeur.findOneAndUpdate(
        { user: userId },
        {
          ...(imCin && { imCin }),
          ...(lat && { lat }),
          ...(lng && { lng }),
        },
        { new: true }
      );


    res.json({
      success: true,
      message: "Profil mis à jour",
      user: updatedUser,
      vendeur: updatedVendeur,
    });
  } catch (error) {
    console.error(" Erreur update vendeur :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


exports.toggleVerificationVendeur = async (req, res) => {
  try {
    const vendeur = await Vendeur.findOne({ user: req.params.id });

    if (!vendeur) {
      return res.status(404).json({ success: false, message: "Vendeur non trouvé" });
    }

    vendeur.verified = !vendeur.verified;
    await vendeur.save();

    res.json({ success: true, verified: vendeur.verified });
  } catch (error) {
    console.error("Erreur toggleVerificationVendeur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
exports.getAllVendeursWithUser = async (req, res) => {
  try {
    const vendeurs = await Vendeur.find().populate("user"); // ⚠️ لازم ref في schema
    res.json(vendeurs);
  } catch (err) {
    console.error("Erreur getAllVendeurs:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
