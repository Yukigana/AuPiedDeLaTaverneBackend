import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import tablesRoutes from "./routes/table.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/table", tablesRoutes);

// Connexion MongoDB
const start = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/jdr");
    console.log("MongoDB connecté");

    app.listen(5000, () => {
      console.log("Serveur lancé sur http://localhost:5000");
    });
  } catch (err) {
    console.error("Erreur MongoDB:", err);
  }
};

start();
