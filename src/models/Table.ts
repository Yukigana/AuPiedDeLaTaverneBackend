import { Schema, model } from "mongoose";

export interface ITable {
  name: string;
  players: string[];
}

const tableSchema = new Schema<ITable>({
  name: { type: String, required: true },
  players: { type: [String], default: [] },
});

const Table = model<ITable>("Table", tableSchema);

export default Table;
