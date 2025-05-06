const Payment = require("../models/payment"); // 📌 استدعاء modèle Payment

exports.confirmPayment = async (req, res) => {
  try {
    const {
      acheteurId,
      fullName,
      email,
      phone,
      address,
      country,
      amount,
      paymentMethod,
    } = req.body;

    // ✅ Vérification des champs requis
    if (
      !acheteurId || !fullName || !email || !phone ||
      !address || !country || !amount || !paymentMethod
    ) {
      return res.status(400).json({ success: false, message: "Champs manquants" });
    }

    // 💾 Enregistrement dans la base de données
    const payment = new Payment({
      acheteurId,
      fullName,
      email,
      phone,
      address,
      country,
      amount,
      paymentMethod,
      status: "succès", // par défaut (simulation)
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: "Paiement enregistré avec succès",
      payment,
    });

  } catch (error) {
    console.error("Erreur lors du paiement:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
