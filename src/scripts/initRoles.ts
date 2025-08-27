import mongoose from "mongoose";
import Role from "../models/Role.js";

const MONGO_URI = "mongodb://localhost:27017/jdr"; // ⚠️ adapte si besoin

const initRoles = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    const roles = ["admin", "player"];

    for (const roleName of roles) {
      const exists = await Role.findOne({ name: roleName });
      if (!exists) {
        await new Role({ name: roleName }).save();
        console.log(`+ Rôle ajouté: ${roleName}`);
      } else {
        console.log(`= Rôle déjà présent: ${roleName}`);
      }
    }

    console.log("🎉 Initialisation terminée");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur init roles:", err);
    process.exit(1);
  }
};

initRoles();
