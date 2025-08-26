import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User.js";

export interface ITable extends Document {
  name: string;
  description: string;
  mj: IUser["_id"];
  players: IUser["_id"][];
  status: "En préparation" | "En cours" | "Terminée";
  restrictedToAdherents: boolean;
  maxPlayers: number;
  sessionDate: Date;
  createdAt: Date;
}

const tableSchema: Schema = new Schema<ITable>(
  {
    name: { type: String, required: true },
    description: { type: String },
    mj: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["En préparation", "En cours", "Terminée"],
      default: "En préparation"
    },
    restrictedToAdherents: { type: Boolean, default: false },
    maxPlayers: { type: Number, required: true, min: 1 },
    sessionDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
  }
);

export default mongoose.model<ITable>("Table", tableSchema);
