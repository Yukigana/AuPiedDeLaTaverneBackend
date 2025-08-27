import mongoose from "mongoose";
import Role from "./models/Role.js";
import User from "./models/User.js";
import Table from "./models/Table.js";
import logger from "./config/logger.js";

const MONGO_URI = "mongodb://localhost:27017/jdr";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB for seeding");
    console.log("Connected to MongoDB for seeding");

    await Role.deleteMany({});
    await User.deleteMany({});
    await Table.deleteMany({});
    logger.info("Cleared existing data");
    console.log("Cleared existing data");

    // Création des rôles
    const roles = await Role.insertMany([
      { name: "Admin", description: "Super user with all rights" },
      { name: "MJ", description: "Maître du jeu" },
      { name: "Joueur", description: "Standard player" },
      { name: "Adhérent", description: "Registered member" }
    ]);
    logger.info("Roles created");
    console.log("Roles created");

    // Création d’utilisateurs
    const adminUser = await User.create({
      username: "admin",
      email: "admin@example.com",
      password: "hashedpassword123",
      roles: [roles.find(r => r.name === "Admin")!._id]
    });

    const mjUser = await User.create({
      username: "gandalf",
      email: "mj@example.com",
      password: "hashedpassword123",
      roles: [roles.find(r => r.name === "MJ")!._id]
    });

    const playerUser1 = await User.create({
      username: "aragorn",
      email: "joueur1@example.com",
      password: "hashedpassword123",
      roles: [
        roles.find(r => r.name === "Joueur")!._id,
        roles.find(r => r.name === "Adhérent")!._id
      ]
    });

    const playerUser2 = await User.create({
      username: "legolas",
      email: "joueur2@example.com",
      password: "hashedpassword123",
      roles: [roles.find(r => r.name === "Joueur")!._id]
    });

    const playerUser3 = await User.create({
      username: "gimli",
      email: "joueur3@example.com",
      password: "hashedpassword123",
      roles: [roles.find(r => r.name === "Adhérent")!._id]
    });

    logger.info("👤 Users created");
    console.log("👤 Users created");

    // Création d’une table
    const table = await Table.insertMany([
      {
        name: "La Quête du Dragon",
        description: "Une épopée épique avec dragons et magie.",
        mj: mjUser._id,
        players: [playerUser1._id, playerUser2._id],
        status: "En préparation",
        restrictedToAdherents: true,
        maxPlayers: 5,
        sessionDate: new Date("2025-09-15T20:00:00Z")
      },
      {
        name: "Les Mines de la Moria",
        description: "Exploration souterraine pleine de dangers.",
        mj: mjUser._id,
        players: [playerUser3._id],
        status: "En cours",
        restrictedToAdherents: false,
        maxPlayers: 4,
        sessionDate: new Date("2025-09-20T18:30:00Z")
      },
      {
        name: "Voyage vers le Mordor",
        description: "Une quête désespérée pour détruire l’Anneau Unique.",
        mj: mjUser._id,
        players: [playerUser1._id, playerUser2._id, playerUser3._id],
        status: "En préparation",
        restrictedToAdherents: true,
        maxPlayers: 6,
        sessionDate: new Date("2025-10-01T19:00:00Z")
      }]);

    logger.info("Tables created");
    console.log("Tables created");

    await mongoose.disconnect();
    logger.info("Database seeded and disconnected");
    console.log("Database seeded and disconnected");
  } catch (err) {
    logger.error("Error seeding database:", err);
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seed();
