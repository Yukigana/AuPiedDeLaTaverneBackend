import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
}

const roleSchema: Schema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IRole>("Role", roleSchema);