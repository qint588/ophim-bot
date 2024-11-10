import connectToDatabase from "@/lib/mongoose";
import Episode from "@/models/episode.model";
import User from "@/models/user.model";
import movieService from "@/services/movie.service";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    await connectToDatabase();

    if (req.body) {
      const { userId, episodeId } = req.body;
      const user = await User.findOne({
        userId,
      });
      if (!user) {
        res.status(400).json({
          message: `User not found`,
        });
      }

      const episode = await Episode.findOne({
        _id: episodeId,
      });
      if (!episode) {
        res.status(400).json({
          message: `Movie not found`,
        });
      }

      await movieService.storeWatchHistory(
        user._id,
        episode.movie,
        episode.server,
        episode._id
      );
    }

    res.status(200).json({
      message: "Success",
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({
      message: `Method ${req.method} Not Allowed`,
    });
  }
}
