import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import tablesRoutes from "./routes/table.js";
import authRoutes from "./routes/auth.js";
import tableRoutes from "./routes/table.js";
import logger from "./config/logger.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/table", tableRoutes);
// Routes
app.use("/table", tablesRoutes);

// Connexion MongoDB
const start = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/jdr");
    logger.info("MongoDB connecté");

    app.listen(5000, () => {
      logger.info("Serveur lancé sur http://localhost:5000");
    });
  } catch (err) {
    logger.crit(`Erreur MongoDB: ${err}`);
  }
};

start();
