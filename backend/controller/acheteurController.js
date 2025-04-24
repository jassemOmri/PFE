const User = require("../models/User");

// 🔍 Récupérer les infos du profil acheteur
exports.getAcheteurProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "acheteur") {
      return res.status(404).json({ success: false, message: "Profil acheteur non trouvé" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ Erreur récupération profil acheteur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// 🛠️ Mettre à jour le profil acheteur
exports.updateAcheteurProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { numTele, dateNaissance, addPostale } = req.body;

    let addPostaleParsed = addPostale;
    if (typeof addPostale === "string") {
      addPostaleParsed = JSON.parse(addPostale);
    }

    const imProfile = req.files?.imProfile?.[0]?.filename;

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

    res.json({
      success: true,
      message: "Profil acheteur mis à jour",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Erreur update acheteur :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
