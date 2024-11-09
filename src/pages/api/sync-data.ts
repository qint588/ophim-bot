// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import connectToDatabase from "@/lib/mongoose";
import Category from "@/models/category.model";
import Country from "@/models/country.model";
import Episode, { IEpisode } from "@/models/episode.model";
import Movie from "@/models/movie.model";
import Server, { IServer } from "@/models/server.model";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

interface IOphimCategory {
  name: string;
  slug: string;
}

interface IOphimMovie {
  tmdb: {
    id: string;
  };
  imdb: {
    id: string;
  };
  modified: {
    time: string;
  };
  _id: string;
  name: string;
  origin_name: string;
  content: string;
  type: string;
  status: string;
  thumb_url: string;
  is_copyright: boolean;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  notify: string;
  showtimes: string;
  slug: string;
  year: number;
  category: IOphimCategory[];
  country: IOphimCategory[];
  chieurap: boolean;
  poster_url: string;
  sub_docquyen: boolean;
}

interface IOphimEpisode {
  server_name: string;
  server_data: Array<{
    name: string;
    slug: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
  }>;
}

interface IOphimObjectMovie {
  movie: IOphimMovie;
  episodes: IOphimEpisode[];
}

const fetchCategories = async () => {
  const response = await axios("https://ophim1.com/the-loai");
  const data = response.data as IOphimCategory[];
  for (const item of data) {
    await Category.findOneAndUpdate(
      {
        slug: item.slug,
      },
      {
        name: item.name,
        slug: item.slug,
      },
      {
        upsert: true,
        new: true,
      }
    );
  }
};

const fetchCountries = async () => {
  const response = await axios("https://ophim1.com/quoc-gia");
  const data = response.data as IOphimCategory[];
  for (const item of data) {
    await Country.findOneAndUpdate(
      {
        slug: item.slug,
      },
      {
        name: item.name,
        slug: item.slug,
      },
      {
        upsert: true,
        new: true,
      }
    );
  }
};

const fetchMovies = async (page: number = 1) => {
  const response = await axios.get(
    "https://ophim1.com/danh-sach/phim-moi-cap-nhat",
    {
      params: { page },
    }
  );
  const listPromise = response.data.items.map((el: { slug: string }) =>
    axios.get("https://ophim1.com/phim/" + el.slug)
  );

  const movies = (await Promise.allSettled(listPromise))
    .filter((el) => el.status == "fulfilled")
    .map((el) => el.value.data) as IOphimObjectMovie[];

  console.table(movies.map((el) => el.movie.name));
  for (const movie of movies) {
    await storeMovie(movie);
  }
};

const storeMovie = async (data: IOphimObjectMovie) => {
  const { movie, episodes } = data;
  let catIds = [];
  for (const category of movie.category) {
    const cat = await Category.findOneAndUpdate(
      { slug: category.slug },
      { name: category.name, slug: category.slug },
      {
        upsert: true,
        new: true,
      }
    );
    catIds.push(cat._id);
  }

  let countryIds = [];
  for (const country of movie.country) {
    const ctry = await Country.findOneAndUpdate(
      { slug: country.slug },
      { name: country.name, slug: country.slug },
      {
        upsert: true,
        new: true,
      }
    );
    countryIds.push(ctry._id);
  }

  const movieSaved = await Movie.findOneAndUpdate(
    {
      slug: movie.slug,
    },
    {
      imdb: movie.imdb.id,
      tmdb: movie.tmdb.id,
      name: movie.name,
      originalName: movie.origin_name,
      slug: movie.slug,
      content: movie.content,
      type: movie.type,
      status: movie.status,
      porsterUrl: movie.poster_url,
      thumbUrl: movie.thumb_url,
      exclusiveSub: movie.sub_docquyen,
      cinema: movie.chieurap,
      time: movie.time,
      episodeCurrent: movie.episode_current,
      episodeTotal: movie.episode_total,
      quality: movie.quality,
      lang: movie.lang,
      year: movie.year,
      modifiedTimeAt: new Date(movie.modified.time),
      categories: catIds,
      countries: countryIds,
    },
    {
      upsert: true,
      new: true,
    }
  );

  let episodeIds = [];
  for (const episodeServer of episodes) {
    const server: IServer = await Server.findOneAndUpdate(
      {
        name: episodeServer.server_name,
      },
      {
        name: episodeServer.server_name,
      },
      {
        upsert: true,
        new: true,
      }
    );

    for (const episodeData of episodeServer.server_data) {
      const episodeSaved: IEpisode = await Episode.findOneAndUpdate(
        {
          server: server._id,
          movie: movieSaved._id,
          slug: episodeData.slug,
        },
        {
          name: episodeData.name,
          slug: episodeData.slug,
          episodeLinkEmbed: episodeData.link_embed,
          episodeLinkM3u8: episodeData.link_m3u8,
          server: server._id,
        },
        {
          upsert: true,
          new: true,
        }
      );
      episodeIds.push(episodeSaved._id);
    }
  }

  const movieUpdated = await Movie.findByIdAndUpdate(
    movieSaved._id,
    {
      $set: {
        episodes: episodeIds,
      },
    },
    { new: true, runValidators: true }
  );

  console.log({
    movieId: movieUpdated._id,
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await connectToDatabase();

  await fetchCategories();
  await fetchCountries();

  const maxPage = (req?.query?.max_page || 30) as number;
  for (let page = 1; page <= maxPage; page++) {
    console.table({ page });

    await fetchMovies(page);
  }
  res.status(200).json({ message: "Running..." });
}
