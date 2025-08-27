import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";

const MONGO_URI = "mongodb://localhost:27017/jdr"; // ⚠️ adapte si besoin

const initUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // Récupérer les rôles
    const adminRole = await Role.findOne({ name: "admin" });
    const playerRole = await Role.findOne({ name: "player" });

    if (!adminRole || !playerRole) {
      console.error(
        "❌ Les rôles n'existent pas encore. Lance d'abord: npm run init:roles"
      );
      process.exit(1);
    }

    // Créer un admin par défaut
    const adminEmail = "admin@test.com";
    const adminPassword = "admin123";
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = new User({
        username: "SuperAdmin",
        email: adminEmail,
        password: hashedPassword,
        roles: [adminRole._id],
      });
      await adminUser.save();
      console.log(`+ Admin créé: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`= Admin déjà présent: ${adminEmail}`);
    }

    // Créer un player par défaut
    const playerEmail = "player@test.com";
    const playerPassword = "player123";
    let playerUser = await User.findOne({ email: playerEmail });
    if (!playerUser) {
      const hashedPassword = await bcrypt.hash(playerPassword, 10);
      playerUser = new User({
        username: "DefaultPlayer",
        email: playerEmail,
        password: hashedPassword,
        roles: [playerRole._id],
      });
      await playerUser.save();
      console.log(`+ Player créé: ${playerEmail} / ${playerPassword}`);
    } else {
      console.log(`= Player déjà présent: ${playerEmail}`);
    }

    console.log("🎉 Initialisation utilisateurs terminée");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur init users:", err);
    process.exit(1);
  }
};

initUsers();
