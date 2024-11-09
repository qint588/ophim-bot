import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "./category.model";
import { ICountry } from "./country.model";

export interface IMovie extends Document {
  imdb: string | null;
  tmdb: string | null;
  name: string;
  originalName: string;
  slug: string;
  content: string;
  type: string;
  status: string;
  porsterUrl: string | null;
  thumbUrl: string | null;
  exclusiveSub: boolean;
  cinema: boolean;
  time: string | null;
  episodeCurrent: string | null;
  episodeTotal: string | null;
  quality: string | null;
  lang: string | null;
  year: number;
  modifiedTimeAt: Date;
  categories: ICategory["_id"][];
  countries: ICountry["_id"][];
  episodes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  sortId: string;
}

const movieSchema = new Schema<IMovie>(
  {
    tmdb: { type: String },
    imdb: { type: String },
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true },
    porsterUrl: { type: String },
    thumbUrl: { type: String },
    exclusiveSub: Boolean,
    cinema: Boolean,
    time: { type: String },
    episodeCurrent: { type: String },
    episodeTotal: { type: String },
    quality: { type: String },
    lang: { type: String },
    year: Number,
    modifiedTimeAt: Date,
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    countries: [{ type: Schema.Types.ObjectId, ref: "Country" }],
    episodes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Episode" }],
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ name: "text", originalName: "text", content: "text" });

const Movie =
  mongoose.models.Movie || mongoose.model<IMovie>("Movie", movieSchema);

export default Movie;
