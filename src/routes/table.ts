import { Router } from "express";
import Table from "../models/Table.js";

const router = Router();

// Récupérer toutes les tables
router.get("/", async (_req, res) => {
  const tables = await Table.find();
  res.json(tables);
});

// Créer une table
router.post("/", async (req, res) => {
  const { name } = req.body; // ici req.body doit exister grâce à express.json()

  if (!name) {
    return res.status(400).json({ error: "Le nom est requis" });
  }

  const table = new Table({ name, players: [] });
  await table.save();
  res.status(201).json(table);
});

// Ajouter un joueur
router.post("/:id/players", async (req, res) => {
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
});

export default router;
