const Livreur = require("../models/Livreur");
const Order = require("../models/order");
const User = require("../models/User");
const Product = require("../models/product");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

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

exports.generateDeliveryPDF = async (req, res) => {
  try {
    const { livreurId } = req.params;
    const orders = await Order.find({ livreur: livreurId }).populate("acheteurId");

    if (!orders.length) {
      return res.status(404).json({ message: "Aucune commande trouvée." });
    }

    const doc = new PDFDocument({ margin: 40 });
    const filename = `bon_livraison_${Date.now()}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // 🖼️ Logo
    const logoPath = path.join(__dirname, "../public/images/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 80 });
    }

    doc.fontSize(20).font("Helvetica-Bold").text("Bon de Livraison", 0, 40, { align: "center" });
    doc.moveDown();

    const acheteur = orders[0].acheteurId;
    doc.fontSize(12).font("Helvetica").text(`Client        : ${acheteur.name}`);
    doc.text(`Téléphone     : ${acheteur.numTele || "N/A"}`);
    const adr = acheteur.addPostale;
    doc.text(`Adresse       : ${adr?.rue || ""}, ${adr?.ville || ""}, ${adr?.region || ""}, ${adr?.pays || ""}`).moveDown();

    doc.fontSize(13).font("Helvetica-Bold").text("Produits commandés :", { underline: true }).moveDown(0.3);
    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("Produit", 50, doc.y, { continued: true });
    doc.text("Quantité", 200, doc.y, { continued: true });
    doc.text("Prix Unitaire", 300, doc.y, { continued: true });
    doc.text("Total", 400, doc.y);
    doc.moveDown(0.2).font("Helvetica");

    let totalProduits = 0;
    const fraisLivraison = 10;

    for (const order of orders) {
      for (const p of order.products) {
        const prix = p.quantity * p.price;
        totalProduits += prix;

        doc.text(p.productName, 50, doc.y, { continued: true });
        doc.text(`${p.quantity}`, 200, doc.y, { continued: true });
        doc.text(`${p.price.toFixed(2)} dt`, 300, doc.y, { continued: true });
        doc.text(`${prix.toFixed(2)} dt`, 400, doc.y);
        doc.moveDown(0.3);
      }
    }

    doc.moveDown();
    doc.font("Helvetica-Bold");
    doc.text(`Total Produits      : ${totalProduits.toFixed(2)} dt`);
    doc.text(`Frais de Livraison  : ${fraisLivraison.toFixed(2)} dt`);
    doc.text(`Montant Total       : ${(totalProduits + fraisLivraison).toFixed(2)} dt`);
    doc.moveDown(1);

    // 📦 QR Code


    const qrContent = `CommandeLivraison-${livreurId}-${Date.now()}`;

const qrPath = path.join(__dirname, "../public/temp_qr.png");
const qrDataUrl = await QRCode.toDataURL(qrContent);
const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");

// ✅ Assurer que le dossier existe
const qrFolder = path.join(__dirname, "../public");
if (!fs.existsSync(qrFolder)) {
  fs.mkdirSync(qrFolder, { recursive: true });
}

fs.writeFileSync(qrPath, base64Data, "base64");

    if (fs.existsSync(qrPath)) {
      doc.image(qrPath, { width: 100, align: "center" });
      doc.text("Scannez ce QR Code pour vérifier la commande", { align: "center" });
    }

    doc.end();

    // 🧼 Nettoyage QR
    setTimeout(() => {
      if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
    }, 3000);

  } catch (err) {
    console.error("Erreur PDF:", err);
    res.status(500).json({ message: "Erreur serveur PDF" });
  }
};
// ✅ Mise à jour profil livreur
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
