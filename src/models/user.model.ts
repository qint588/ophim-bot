import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userId: number;
  firstName: string;
  userName: string;
  languageCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: Number, required: true, unique: true },
    firstName: { type: String, required: true },
    userName: { type: String, required: true },
    languageCode: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
