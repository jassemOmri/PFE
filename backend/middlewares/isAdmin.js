const jwt = require("jsonwebtoken");
const SECRET_KEY = "mysecretkey"; // doit être identique à celui de login.js

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("🔐 [isAdmin] Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou mal formé" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("✅ [isAdmin] JWT décodé :", decoded);

    if (decoded.role !== "admin") {
      console.warn("⛔ [isAdmin] Accès refusé : rôle =", decoded.role);
      return res.status(403).json({ message: "Accès interdit - Admin uniquement" });
    }

    req.user = decoded; // on attache les infos décodées à la requête
    next(); // continuer
  } catch (err) {
    console.error("❌ [isAdmin] Token invalide :", err.message);
    return res.status(403).json({ message: "Token invalide" });
  }
};
