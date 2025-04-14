const Livreur = require("../models/Livreur");

exports.getLivreurs = async (req, res) => {
  try {
    const livreurs = await Livreur.find();
    res.json(livreurs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.setDisponibilite = async (req, res) => {
  try {
    const { disponible } = req.body;
    const livreur = await Livreur.findOneAndUpdate(
      { user: req.params.userId },
      { disponible },
      { new: true }
    );
    res.json({ success: true, livreur });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};