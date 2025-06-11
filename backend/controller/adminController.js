const bcrypt = require("bcryptjs");

const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");     
    res.json({ user: users });
  } catch (error) {
    res.status(500).json({ message: "Erreur chargement utilisateurs" });
  }
};


exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    //  Vérifie si l'email existe déjà
    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "Email already exists" });
    }

    //  Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Créer l'utilisateur
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true // par défaut actif
    });

    await newUser.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur createUser:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { id, name, email, role, password } = req.body;
   

    const updateFields = {};

    if (name?.trim()) updateFields.name = name;
    if (email?.trim()) updateFields.email = email;
    if (role?.trim()) updateFields.role = role;

    if (password?.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }
    console.log("🧾 Nouveau nom :", name);

    await User.findByIdAndUpdate(id, updateFields);
    console.log("🧠 Champs à mettre à jour :", updateFields);

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur update:", err);
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour" });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur suppression:", err);
    res.status(500).json({ success: false, message: "Erreur lors de la suppression" });
  }
};
exports.toggleUserActivation = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, isActive: user.isActive });
  } catch (err) {
    console.error("Erreur activation:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
