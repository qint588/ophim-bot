import mongoose, { Schema, Document } from "mongoose";

export interface ICountry extends Document {
  name: string;
  slug: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const countrySchema = new Schema<ICountry>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String },
  },
  {
    timestamps: true,
  }
);

const Country =
  mongoose.models.Country || mongoose.model<ICountry>("Country", countrySchema);

export default Country;
