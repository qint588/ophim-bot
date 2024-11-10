import mongoose, { Schema, Document } from "mongoose";

export interface IServer extends Document {
  name: string;
  slug: string;
}

const serverSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
});

const Server =
  mongoose.models.Server || mongoose.model<IServer>("Server", serverSchema);
export default Server;
