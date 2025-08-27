import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User.js";
import Role from "../models/Role.js";
import logger from "../config/logger.js";

import dotenv from "dotenv";

dotenv.config();
const router = Router();

// ----------------- REGISTER -----------------
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    // Validation manuelle
    if (!username || username.length < 3) {
      return res
        .status(400)
        .json({ error: "Pseudo trop court (min 3 caractères)" });
    }
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Email invalide" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Mot de passe trop court (min 6 caractères)" });
    }

    // Vérifier doublons
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Tentative d'inscription avec email déjà utilisé: ${email}`);
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // Hasher mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vérifier les rôles (si fournis)
    let roleIds: mongoose.Types.ObjectId[] = [];

    if (roles && roles.length > 0) {
      const foundRoles = await Role.find({ name: { $in: roles } });
      roleIds = foundRoles.map((r) => r._id as mongoose.Types.ObjectId);
    } else {
      // Rôle par défaut = "player"
      const defaultRole = await Role.findOne({ name: "player" });
      if (defaultRole) roleIds = [defaultRole._id as mongoose.Types.ObjectId];
    }

    const user = new User({
      username,
      email,
      password: hashedPassword,
      roles: roleIds,
    });

    await user.save();

    logger.info(`Nouvel utilisateur enregistré: ${user._id} (${email})`);
    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err: any) {
    logger.error("Erreur serveur register: " + err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ----------------- LOGIN -----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation manuelle
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Email invalide" });
    }
    if (!password) {
      return res.status(400).json({ error: "Mot de passe requis" });
    }

    const user = await User.findOne({ email }).populate("roles");
    if (!user) {
      logger.warn(`Échec de connexion, email non trouvé: ${email}`);
      return res.status(400).json({ error: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(
        `Échec de connexion, mot de passe incorrect pour email: ${email}`
      );
      return res.status(400).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    logger.info(`Connexion réussie pour utilisateur: ${user._id}`);
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
    logger.error("Erreur serveur login: " + err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ----------------- ME (protégé) -----------------
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn("Accès non autorisé à /me, pas de token");
    return res.status(401).json({ error: "Non autorisé" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("roles");
    if (!user) {
      logger.warn("Utilisateur introuvable pour /me");
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    logger.info(`Données utilisateur récupérées pour /me: ${decoded.id}`);
    res.json(user);
  } catch (err) {
    logger.warn("Token invalide pour /me");
    res.status(401).json({ error: "Token invalide" });
  }
});

export default router;
