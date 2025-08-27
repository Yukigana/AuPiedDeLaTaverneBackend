import { Router } from "express";
import Table from "../models/Table.js";
import { verifyToken, AuthRequest } from "../middleware/authMiddleware.js";

const router = Router();
const logger = require ('./src/config/logger')

// --------------------
// Récupérer toutes les tables (public)
// --------------------
router.get("/", async (_req, res) => {
  try {
    const tables = await Table.find().populate("mj").populate("players");
    logger.info("Récupération de toutes les tables");
    console.log("Récupération de toutes les tables");
    res.json(tables);
  } catch (err: any) {
    logger.error(err.message);
    console.error("Erreur récupération tables:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// --------------------
// Créer une table (protégé)
// --------------------
router.post("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      description,
      maxPlayers,
      sessionDate,
      restrictedToAdherents,
    } = req.body;

    // Vérification des champs obligatoires
    if (!name || !maxPlayers || !sessionDate) {
      logger.warn("Champs requis manquants pour création table");
      console.warn("Champs requis manquants pour création table");
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    // Le MJ = utilisateur connecté (issu du JWT)
    const mjId = req.user.id;

    const table = new Table({
      name,
      description,
      mj: mjId,
      maxPlayers,
      sessionDate,
      restrictedToAdherents,
      players: [],
    });

    await table.save();
    logger.info(`Table créée: ${table._id} par MJ: ${mjId}`);
    console.log(`Table créée: ${table._id} par MJ: ${mjId}`);
    res.status(201).json(table);
  } catch (err: any) {
    logger.error(err.message);
    console.error("Erreur création table:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// --------------------
// Rejoindre une table (protégé)
// --------------------
router.post("/:id/players", verifyToken, async (req: AuthRequest, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      logger.warn(`Table introuvable: ${req.params.id}`);
      console.warn(`Table introuvable: ${req.params.id}`);
      return res.status(404).json({ error: "Table introuvable" });
    }

    const userId = req.user.id;

    // Vérifier si déjà inscrit
    if (table.players.includes(userId)) {
      logger.warn(`Utilisateur déjà inscrit: ${userId} à la table: ${req.params.id}`);
      console.warn(`Utilisateur déjà inscrit: ${userId} à la table: ${req.params.id}`);
      return res
        .status(400)
        .json({ error: "Vous êtes déjà inscrit à cette table" });
    }

    // Vérifier si maxPlayers atteint
    if (table.players.length >= table.maxPlayers) {
      logger.warn(`Table complète: ${req.params.id}`);
      console.warn(`Table complète: ${req.params.id}`);
      return res.status(400).json({ error: "Table complète" });
    }

    table.players.push(userId);
    await table.save();

    logger.info(`Utilisateur: ${userId} a rejoint la table: ${req.params.id}`);
    res.json(table);
  } catch (err: any) {
    logger.error(err.message);
    console.error("Erreur ajout joueur:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
