import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import tablesRoutes from "./routes/table.js";
import authRoutes from "./routes/auth.js";
import logger from "./config/logger.js";

dotenv.config();
const app = express();

// --------------------
// Middlewares globaux
// --------------------
app.use(cors());
app.use(express.json());
app.use(helmet()); // 🔐 sécurise les en-têtes HTTP

// --------------------
// Limite brute force sur /auth
// --------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requêtes par IP
  message: { error: "Trop de tentatives, réessayez plus tard." },
});
app.use("/auth", authLimiter, authRoutes);

// --------------------
// Routes
// --------------------
app.use("/table", tablesRoutes);

// --------------------
// Connexion MongoDB
// --------------------
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    logger.info("✅ MongoDB connecté");

    app.listen(5000, () => {
      logger.info("🚀 Serveur lancé sur http://localhost:5000");
    });
  } catch (err) {
    logger.error(`❌ Erreur MongoDB: ${err}`);
  }
};

start();
