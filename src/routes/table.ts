import { Router } from "express";
import Table from "../models/Table.js";

const router = Router();

// Récupérer toutes les tables
router.get("/", async (_req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (err: any) {
    console.error("Erreur récupération tables:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Créer une table
router.post("/", async (req, res) => {
  try {
    console.log("Body reçu:", req.body);

    const {
      name,
      description,
      mj,
      maxPlayers,
      sessionDate,
      restrictedToAdherents,
    } = req.body;

    // Vérification des champs requis
    if (!name || !mj || !maxPlayers || !sessionDate) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    const table = new Table({
      name,
      description,
      mj,
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

// Ajouter un joueur
router.post("/:id/players", async (req, res) => {
  try {
    const { playerName } = req.body;
    if (!playerName) {
      return res.status(400).json({ error: "Le nom du joueur est requis" });
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ error: "Table introuvable" });
    }

    table.players.push(playerName);
    await table.save();
    res.json(table);
  } catch (err: any) {
    console.error("Erreur ajout joueur:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
