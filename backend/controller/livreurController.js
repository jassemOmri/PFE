const Livreur = require("../models/Livreur");
const Order = require("../models/order");
const User = require("../models/User");
const Product = require("../models/product");
const ExcelJS = require("exceljs");

exports.getLivreurs = async (req, res) => {
  try {
    const livreurs = await Livreur.find();
    res.json(livreurs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.getLivreurById = async (req, res) => {
  try {
    const livreur = await Livreur.findOne({ user: req.params.id });

    if (!livreur) {
      return res.status(404).json({ message: "Livreur non trouvé" });
    }

    res.json(livreur);
  } catch (error) {
    console.error("Erreur getLivreurById :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// 📦 Mettre à jour la disponibilité du livreur
exports.setDisponibilite = async (req, res) => {
  try {
    const { disponible } = req.body;
    const { userId } = req.params;

    // 🔍 Mise à jour du champ disponible
    const livreur = await Livreur.findOneAndUpdate(
      { user: userId },
      { disponible },
      { new: true }
    );

    if (!livreur) {
      return res.status(404).json({ success: false, message: "Livreur non trouvé" });
    }

    res.json({ success: true, message: "Disponibilité mise à jour", livreur });
  } catch (error) {
    console.error("Erreur setDisponibilite :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// 📦 Voir les commandes disponibles
exports.getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "confirmée", livreur: null });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Accepter une commande
exports.acceptOrder = async (req, res) => {
  const { orderId, livreurId } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Commande non trouvée" });
    if (order.livreur) return res.status(400).json({ message: "Commande déjà prise" });

    order.livreur = livreurId;
    order.status = "en cours de livraison";  
    await order.save();

    res.json({ message: "Commande acceptée", order });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🧾 Télécharger les infos de livraison (Excel)
exports.downloadDeliveryExcel = async (req, res) => {
  try {
    const { livreurId } = req.params;
    const orders = await Order.find({ livreur: livreurId }).populate("acheteurId").populate("livreur");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Livraisons");

    worksheet.columns = [
      { header: "Nom Acheteur", key: "acheteur", width: 20 },
      { header: "Nom Vendeur", key: "vendeur", width: 20 },
      { header: "Nom Livreur", key: "livreur", width: 20 },
      { header: "Produit", key: "produit", width: 30 },
      { header: "Quantité", key: "quantite", width: 10 },
      { header: "Prix Produit", key: "prix", width: 15 },
      { header: "Prix Livraison", key: "prixLivraison", width: 15 },
      { header: "Adresse", key: "adresse", width: 30 },
      { header: "Région", key: "region", width: 15 },
    ];

    for (const order of orders) {
      const acheteur = order.acheteurId;
      const livreur = order.livreur;

      for (const p of order.products) {
        const vendeur = await User.findById(p.vendeurId);
        worksheet.addRow({
          acheteur: acheteur.name,
          vendeur: vendeur?.name || "Non trouvé",
          livreur: livreur?.user || "Non défini",
          produit: p.productName,
          quantite: p.quantity,
          prix: p.price,
          prixLivraison: 7.0, // Tu peux personnaliser
          adresse: `${acheteur.addPostale?.rue || ""}, ${acheteur.addPostale?.ville || ""}`,
          region: acheteur.addPostale?.region || "",
        });
      }
    }

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=livraisons.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Erreur export Excel :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.toggleDisponibilite = async (req, res) => {
  try {
    const livreur = await Livreur.findOne({ user: req.params.id });
    if (!livreur) {
      return res.status(404).json({ message: "Livreur non trouvé" });
    }

    livreur.disponible = !livreur.disponible;
    await livreur.save();

    res.json({ disponible: livreur.disponible });
  } catch (err) {
    console.error("Erreur toggleDisponibilite:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.setCommandeLivree = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    order.status = "livrée";
    await order.save();

    res.json({ message: "Commande livrée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.marquerCommandeCommeLivree = async (req, res) => {
  try {
    const { orderId } = req.params;
    const commande = await Order.findById(orderId);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    commande.status = "livrée";
    await commande.save();

    res.json({ message: "Commande marquée comme livrée avec succès" });
  } catch (error) {
    console.error("Erreur mise à jour commande:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// 📥 GET profil livreur connecté
exports.getLivreurProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });

    const livreur = await Livreur.findOne({ user: id });
    if (!livreur) return res.status(404).json({ success: false, message: "Profil livreur non trouvé" });

    res.json({ success: true, user, livreur });
  } catch (error) {
    console.error("Erreur récupération profil livreur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// 🔄 PUT update profil livreur
exports.updateLivreurProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { numTele, dateNaissance, addPostale, lat, lng } = req.body;

    let parsedAddPostale = addPostale;
    if (typeof addPostale === "string") {
      parsedAddPostale = JSON.parse(addPostale); // si envoyé en FormData
    }

    const imProfile = req.files?.imProfile?.[0]?.filename;
    const imCin = req.files?.imCin?.[0]?.filename;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        numTele,
        dateNaissance,
        addPostale: parsedAddPostale,
        ...(imProfile && { imProfile }),
      },
      { new: true }
    );

    const updatedLivreur = await Livreur.findOneAndUpdate(
      { user: id },
      {
        ...(lat && { lat }),
        ...(lng && { lng }),
        ...(imCin && { imCin }),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profil livreur mis à jour",
      user: updatedUser,
      livreur: updatedLivreur,
    });
  } catch (error) {
    console.error("Erreur update livreur :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
