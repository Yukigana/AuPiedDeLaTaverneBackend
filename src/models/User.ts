import mongoose, { Schema, Document } from "mongoose";
import { IRole } from "./Role.js";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  roles: IRole["_id"][];
  createdAt: Date;
}
const userSchema: Schema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // ⚠️ À hacher avant save
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
    createdAt: { type: Date, default: Date.now }
  }
);

export default mongoose.model<IUser>("User", userSchema);