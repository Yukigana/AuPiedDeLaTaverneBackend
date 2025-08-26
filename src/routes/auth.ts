import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";

const router = Router();
const JWT_SECRET = "tonSecretUltraSecurise"; // ⚠️ à mettre dans .env

// ----------------- REGISTER -----------------
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    // Vérifier doublons
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email déjà utilisé" });

    // Hasher mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vérifier les rôles (si fournis)
    let roleIds: any[] = [];

    if (roles && roles.length > 0) {
      const foundRoles = await Role.find({ name: { $in: roles } });
      roleIds = foundRoles.map((r) => r._id);
    } else {
      // Rôle par défaut = "player"
      const defaultRole = await Role.findOne({ name: "player" });
      if (defaultRole) roleIds = [defaultRole._id];
    }

    const user = new User({
      username,
      email,
      password: hashedPassword,
      roles: roleIds,
    });

    await user.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err: any) {
    console.error("Erreur register:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ----------------- LOGIN -----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("roles");
    if (!user) return res.status(400).json({ error: "Identifiants invalides" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Identifiants invalides" });

    const token = jwt.sign({ id: user._id, roles: user.roles }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err: any) {
    console.error("Erreur login:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ----------------- ME (protégé) -----------------
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Non autorisé" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("roles");
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Token invalide" });
  }
});

export default router;
