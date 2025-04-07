// middleware/isAdmin.js
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // L'utilisateur est un administrateur, continuer
  } else {
    res.status(403).json({ success: false, message: "Accès refusé" }); // Accès refusé
  }
};

module.exports = isAdmin;