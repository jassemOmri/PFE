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
