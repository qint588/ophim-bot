import mongoose, { Schema, Document } from "mongoose";
import { IServer } from "./server.model";
import { IUser } from "./user.model";
import { IMovie } from "./movie.model";
import { IEpisode } from "./episode.model";

export interface IWatchHistory extends Document {
  userId: IUser["_id"];
  movieId: IMovie["id"];
  episodeId: IEpisode["id"];
  serverId: IServer["id"];
  createdAt: Date;
  updatedAt: Date;
}

const watchHistorySchema = new Schema<IWatchHistory>(
  {
    serverId: { type: Schema.Types.ObjectId, ref: "Server", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    episodeId: { type: Schema.Types.ObjectId, ref: "Episode", required: true },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WatchHistory =
  mongoose.models.WatchHistory ||
  mongoose.model<IWatchHistory>("WatchHistory", watchHistorySchema);

export default WatchHistory;
