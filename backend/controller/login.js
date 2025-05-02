const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "mysecretkey";

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body    ;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
    }
    
  

    const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: "2h" });
 
    let redirectUrl = "/";
    if (user.role === "livreur") {
      redirectUrl = "/livreur-dashboard";
    } else if (user.role === "acheteur") {
      redirectUrl = "/acheteur-dashboard";
    } else if (user.role === "vendeur") {
      redirectUrl = "/vendeur-dashboard";
    } 

    res.json({
      success: true,
      message: "Connexion réussie",
      token,
        userId: user._id, //  //  إرسال `vendeurId`
       userName: user.name,
      role: user.role,
    isActive: user.isActive,
      redirectUrl, 
    });
   } catch (error) {
  console.error("🚨 Erreur exacte :", error.message);
  console.error("🧠 Stack complète :", error.stack);
  res.status(500).json({ success: false, message: "Erreur serveur" });
}
};

