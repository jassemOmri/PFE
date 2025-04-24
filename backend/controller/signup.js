const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Vendeur = require("../models/vendeur");
const Livreur = require("../models/Livreur");
const SECRET_KEY ="jassemomri";

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(" Signup reçu avec : ", req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    if (role === "vendeur") {
       console.log("3 - création vendeur...");
      await new Vendeur({ user: newUser._id }).save();
    }

    if (role === "livreur") {
      await new Livreur({ user: newUser._id }).save();
    }

    
    await newUser.save();

    
    //jwt.sign(payload, secret, options)
    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ success: true, message: "utilisateur enregistre avec sucess", token });
  } catch (error) {
  console.error("erreur exacte :", error.message);
  console.error("stack complète :", error.stack);
  res.status(500).json({ success: false, message: "erreur serveur" });
}

};

