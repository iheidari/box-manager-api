import mongoose, { Schema, Document } from "mongoose";

export interface IItem {
  id: string;
  name: string;
  image: Buffer[];
}

export interface IBox extends Document {
  id: string;
  name: string;
  items: IItem[];
}

const ItemSchema = new Schema<IItem>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  image: [{ type: Buffer, required: true }],
});

const BoxSchema = new Schema<IBox>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  items: [ItemSchema],
});

export const Box = mongoose.model<IBox>("Box", BoxSchema);

