import { Router } from "express";
import Table from "../models/Table.js";
import { verifyToken, AuthRequest } from "../middleware/authMiddleware.js";

const router = Router();

// --------------------
// Récupérer toutes les tables (public)
// --------------------
router.get("/", async (_req, res) => {
  try {
    const tables = await Table.find().populate("mj").populate("players");
    res.json(tables);
  } catch (err: any) {
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
    res.status(201).json(table);
  } catch (err: any) {
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
      return res.status(404).json({ error: "Table introuvable" });
    }

    const userId = req.user.id;

    // Vérifier si déjà inscrit
    if (table.players.includes(userId)) {
      return res
        .status(400)
        .json({ error: "Vous êtes déjà inscrit à cette table" });
    }

    // Vérifier si maxPlayers atteint
    if (table.players.length >= table.maxPlayers) {
      return res.status(400).json({ error: "Table complète" });
    }

    table.players.push(userId);
    await table.save();

    res.json(table);
  } catch (err: any) {
    console.error("Erreur ajout joueur:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
