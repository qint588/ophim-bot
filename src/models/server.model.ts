import mongoose, { Schema, Document } from "mongoose";

export interface IServer extends Document {
  name: string;
}

const serverSchema: Schema = new Schema({
  name: { type: String, required: true },
});

const Server =
  mongoose.models.Server || mongoose.model<IServer>("Server", serverSchema);
export default Server;
