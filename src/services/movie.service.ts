import Category from "@/models/category.model";
import Country from "@/models/country.model";
import Episode, { IEpisode } from "@/models/episode.model";
import Movie, { IMovie } from "@/models/movie.model";
import Server, { IServer } from "@/models/server.model";
import User from "@/models/user.model";
import WatchHistory, { IWatchHistory } from "@/models/watch-history.model";
import * as _ from "lodash";

interface ISearchParms {
  keyword: string;
  page: number;
  limit: number;
}

interface IEpisodeGroupByServer {
  server: IServer;
  episodes: IEpisode[];
}

class MovieService {
  async search(params: ISearchParms): Promise<IMovie[]> {
    const { keyword, page, limit } = params;

    let query = {};

    if (keyword) {
      query = {
        ...query,
        $text: { $search: keyword },
      };
    }

    const movies: IMovie[] = await Movie.find(
      query,
      keyword
        ? {
            score: { $meta: "textScore" },
          }
        : {}
    )
      .select(
        "_id name slug originalName porsterUrl thumbUrl year episodeCurrent time"
      )
      .sort(
        keyword
          ? { score: { $meta: "textScore" } }
          : {
              modifiedTimeAt: -1,
            }
      )
      .skip((page - 1) * limit)
      .limit(limit);

    return movies;
  }
  async getById(_id: string): Promise<IMovie | null> {
    const movie = await Movie.findOne({
      _id,
    });

    if (!movie) {
      return movie;
    }

    movie.categories = await Category.find({
      _id: {
        $in: movie.categories,
      },
    });
    movie.countries = await Country.find({
      _id: {
        $in: movie.countries,
      },
    });

    return movie;
  }
  async getEpisodeByMovieId(_id: string): Promise<IEpisodeGroupByServer[]> {
    const episodes = await Episode.find({
      movie: _id,
    });
    const episodeGroupByServer = _.groupBy(episodes, "server");
    const servers = await Server.find({
      _id: {
        $in: _.keys(episodeGroupByServer),
      },
    });
    const result: IEpisodeGroupByServer[] = [];
    for (const [key, value] of Object.entries(episodeGroupByServer)) {
      result.push({
        server: _.first(servers.filter((el) => el._id == key)),
        episodes: value,
      });
    }
    return result;
  }

  async watchHistory(userId: number, movieId: string): Promise<IWatchHistory> {
    const user = await User.findOne({
      userId,
    });
    let watchHistory: IWatchHistory | null = await WatchHistory.findOne({
      userId: user._id,
      movieId: movieId,
    });

    if (!watchHistory) {
      const servers = await this.getEpisodeByMovieId(movieId);
      const firstServer = _.first(servers);
      watchHistory = await this.storeWatchHistory(
        user._id,
        movieId,
        firstServer?.server?._id as string,
        _.first(firstServer?.episodes)?._id as string
      );
    }
    const server = await Server.findOne({
      _id: watchHistory.serverId,
    });
    watchHistory.serverId = server;
    const episode = await Episode.findOne({
      _id: watchHistory.episodeId,
    });
    watchHistory.episodeId = episode;

    return watchHistory;
  }

  async storeWatchHistory(
    userId: string,
    movieId: string,
    serverId: string,
    episodeId: string
  ): Promise<IWatchHistory> {
    return await WatchHistory.findOneAndUpdate(
      {
        userId: userId,
        movieId: movieId,
      },
      {
        movieId: movieId,
        userId: userId,
        episodeId: episodeId,
        serverId: serverId,
      },
      {
        upsert: true,
        new: true,
      }
    );
  }
}

export default new MovieService();
