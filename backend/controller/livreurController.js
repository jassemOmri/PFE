const Livreur = require("../models/Livreur");
const Order = require("../models/order");
const User = require("../models/User");
const Product = require("../models/product");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { notifyClient } = require("../socketServer"); 

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


// Mettre à jour la disponibilité du livreur
exports.setDisponibilite = async (req, res) => {
  try {
    const { disponible } = req.body;
    const { userId } = req.params;

    //  Mise à jour du champ disponible
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

exports.getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "confirmée", livreur: null });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.acceptOrder = async (req, res) => {
  const { orderId, livreurId } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Commande non trouvée" });
    if (order.livreur) return res.status(400).json({ message: "Commande déjà prise" });

    order.livreur = livreurId;
    order.status = "en cours de livraison";  

    notifyClient(order.acheteurId.toString(), {
      type: "en cours de livraison",
      message: "Votre commande est maintenant en cours de livraison 🚚",
      orderId: order._id,
    });
    await order.save();

    res.json({ message: "Commande acceptée", order });
  } catch (error) {
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

    //  Ajouter la notification WebSocket
    const { notifyClient } = require("../socketServer");
    notifyClient(commande.acheteurId.toString(), {
      type: "livrée",
      message: "Votre commande a été livrée avec succès ",
      orderId: commande._id,
    });

    res.json({ message: "Commande marquée comme livrée avec succès" });
  } catch (error) {
    console.error("Erreur mise à jour commande:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



//   GET profil livreur connecté
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

exports.generateDeliveryPDF = async (req, res) => {
  const mongoose = require("mongoose");
  try {
    const { livreurId } = req.params;
    const { acheteurId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(livreurId) || !mongoose.Types.ObjectId.isValid(acheteurId)) {
      return res.status(400).json({ message: "ID invalide." });
    }

    const livreurObjectId = new mongoose.Types.ObjectId(livreurId);
    const acheteurObjectId = new mongoose.Types.ObjectId(acheteurId);

    // فقط آخر commande
    const order = await Order.findOne({
      livreur: livreurObjectId,
      acheteurId: acheteurObjectId
    }).sort({ createdAt: -1 }).populate("acheteurId");

    if (!order) {
      return res.status(404).json({ message: "Aucune commande trouvée." });
    }

    const doc = new PDFDocument({ margin: 40 });
    const filename = `bon_livraison_${Date.now()}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    //  Info acheteur
    const acheteur = order.acheteurId;
    const adr = acheteur.addPostale || {};
    doc.fontSize(20).font("Helvetica-Bold").text("Bon de Livraison", { align: "center" }).moveDown();
    doc.fontSize(12).font("Helvetica");
    doc.text(`Nom client  : ${acheteur.name || "N/A"}`);
    doc.text(`Téléphone   : ${acheteur.numTele || "N/A"}`);
    doc.text(`Adresse     : ${adr.rue || ""}, ${adr.ville || ""}, ${adr.region || ""}, ${adr.pays || ""}`).moveDown();

    // Contenu commande
    doc.fontSize(13).font("Helvetica-Bold").text(`Commande : ${order._id}`).moveDown(0.3);
    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("Produit", 50, doc.y, { continued: true });
    doc.text("Quantité", 200, doc.y, { continued: true });
    doc.text("Prix U.", 300, doc.y, { continued: true });
    doc.text("Total", 400, doc.y);
    doc.moveDown(0.3).font("Helvetica");

    let totalProduits = 0;
    const fraisLivraison = 5;

    for (const p of order.products) {
      const prix = p.quantity * p.price;
      totalProduits += prix;

      doc.text(p.productName, 50, doc.y, { continued: true });
      doc.text(`${p.quantity}`, 200, doc.y, { continued: true });
      doc.text(`${p.price.toFixed(2)} dt`, 300, doc.y, { continued: true });
      doc.text(`${prix.toFixed(2)} dt`, 400, doc.y);
      doc.moveDown(0.3);
    }

    doc.moveDown(0.2);
    doc.font("Helvetica-Bold");
    doc.text(`Total Produits     : ${totalProduits.toFixed(2)} dt`);
    doc.text(`Frais Livraison    : ${fraisLivraison.toFixed(2)} dt`);
    doc.text(`Montant Total      : ${(totalProduits + fraisLivraison).toFixed(2)} dt`);
    doc.moveDown(0.5);

    //  QR Code
    const qrContent = `http://localhost:5000/api/orders/confirm-delivery/${order._id}`;
    const qrDataUrl = await QRCode.toDataURL(qrContent);
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    const qrPath = path.join(__dirname, `../public/temp_qr_${order._id}.png`);
    fs.writeFileSync(qrPath, base64Data, "base64");

    if (fs.existsSync(qrPath)) {
      doc.image(qrPath, { width: 100, align: "center" });
      doc.text("Scannez pour confirmer la livraison", { align: "center" });
    }

    setTimeout(() => {
      if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
    }, 3000);

    doc.end();
  } catch (err) {
    console.error("Erreur PDF:", err);
    res.status(500).json({ message: "Erreur serveur PDF" });
  }
};



//  Mise à jour profil livreur
exports.updateLivreurProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numTele,
      dateNaissance,
      addPostale,
      lat,
      lng
    } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        numTele,
        dateNaissance,
        addPostale: JSON.parse(addPostale),
        lat,
        lng,
        ...(req.files.imProfile?.[0] && {
          imProfile: req.files.imProfile[0].filename,
        }),
      },
      { new: true }
    );

    let livreur = await Livreur.findOneAndUpdate(
      { user: id },
      {
        lat,
        lng,
        ...(req.files.imCin?.[0] && {
          imCin: req.files.imCin[0].filename,
        }),
      },
      { new: true }
    );

    if (!user || !livreur) {
      return res.status(404).json({ success: false, message: "Livreur ou utilisateur non trouvé" });
    }

    res.json({ success: true, message: "Profil mis à jour avec succès", user, livreur });
  } catch (error) {
    console.error("Erreur updateLivreurProfile:", error);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour" });
  }
};
//  Ajouter dans livreurController.js
exports.toggleVerificationLivreur = async (req, res) => {
  try {
    const livreur = await Livreur.findOne({ user: req.params.id });

    if (!livreur) {
      return res.status(404).json({ success: false, message: "Livreur non trouvé" });
    }

    livreur.verified = !livreur.verified;
    await livreur.save();

    res.json({ success: true, verified: livreur.verified });
  } catch (error) {
    console.error("Erreur toggleVerificationLivreur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
exports.getAllLivreursWithUser = async (req, res) => {
  try {
    const livreurs = await Livreur.find().populate("user"); //  ref = "User"
    res.json(livreurs);
  } catch (err) {
    console.error("Erreur getAllLivreurs:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
