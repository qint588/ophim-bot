import {
  buttonCallback,
  buttonSwitchInlineQuery,
  buttonWebApp,
  telegramBot,
} from "@/lib/telegram";
import movieService from "@/services/movie.service";
import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import * as _ from "lodash";
import Episode, { IEpisode } from "@/models/episode.model";
import User from "@/models/user.model";

const callbackQueryAction = async (query: TelegramBot.CallbackQuery) => {
  const queryData = query.data?.split(",") || [];
  const key = queryData[0];
  if (key == "episodes" && !!queryData[1]) {
    const movieId = queryData[1];
    const servers = await movieService.getEpisodeByMovieId(movieId);
    const watchHistory = await movieService.watchHistory(
      query.message?.chat.id as number,
      movieId
    );

    const selected = {
      serverId: watchHistory.serverId.id,
      episodeId: watchHistory.episodeId.id,
    };

    const serverSelected = _.first(
      servers.filter((el) => el.server._id == selected.serverId)
    );

    const buttonListServer = servers.map((el) =>
      buttonCallback(
        `${el.server.id == selected.serverId ? "✅" : "🔲"} ${el.server.name}`,
        `server,${movieId},${el.server._id}`
      )
    );

    const pageSize = 20;

    let page = Math.ceil(
      ((serverSelected?.episodes.findIndex(
        (el) => el.id == selected.episodeId
      ) as number) +
        1) /
        pageSize
    );

    if (queryData[2]) {
      page = (queryData[2] || 1) as number;
    }

    const pagination = {
      page,
      pageSize,
      chunkSize: 5,
      maxPage: Math.ceil((serverSelected?.episodes?.length || 0) / pageSize),
    };

    const episodes = _.slice(
      serverSelected?.episodes,
      (pagination.page - 1) * pagination.pageSize,
      pagination.page * pagination.pageSize
    );

    const listEpisodeGroup = _.chunk(
      episodes.map((el) =>
        buttonCallback(
          el._id == selected.episodeId ? `›${el.name}‹` : `${el.name}`,
          `choose_episode,${el._id}`
        )
      ),
      pagination.chunkSize
    ).map((el) => {
      if (el.length == pagination.chunkSize) {
        return el;
      }
      let items: InlineKeyboardButton[] = [];
      for (let index = 0; index < pagination.chunkSize; index++) {
        items.push(el[index] || buttonCallback("➖", "unknown"));
      }
      return items;
    });

    let buttonListEpisode: InlineKeyboardButton[][] = [];
    for (
      let index = 0;
      index < Math.ceil(pagination.pageSize / pagination.chunkSize);
      index++
    ) {
      buttonListEpisode.push(
        listEpisodeGroup[index] ||
          Array(pagination.chunkSize).fill(buttonCallback("➖", "unknown"))
      );
    }

    const buttonPagination = [
      buttonCallback(
        "‹‹",
        pagination.page > 1 ? `episodes,${movieId},1` : "unknown"
      ),
      buttonCallback(
        "‹",
        pagination.page > 1
          ? `episodes,${movieId},${+pagination.page - 1}`
          : "unknown"
      ),
      buttonCallback(`›${pagination.page}‹`, "unknown"),
      buttonCallback(
        "›",
        pagination.page < pagination.maxPage
          ? `episodes,${movieId},${+pagination.page + 1}`
          : "unknown"
      ),
      buttonCallback(
        "››",
        pagination.page < pagination.maxPage
          ? `episodes,${movieId},${pagination.maxPage}`
          : "unknown"
      ),
    ];

    await telegramBot.editMessageReplyMarkup(
      {
        inline_keyboard: [
          [...buttonListServer],
          ...buttonListEpisode,
          [...buttonPagination],
          [buttonCallback("🔙 Back", `back_to_movie,${movieId}`)],
        ],
      },
      {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
      }
    );
  }
  if (key == "back_to_movie" && !!queryData[1]) {
    const movieId = queryData[1];
    const watchHistory = await movieService.watchHistory(
      query.message?.chat.id as number,
      movieId
    );
    await telegramBot.editMessageReplyMarkup(
      {
        inline_keyboard: [
          [
            buttonWebApp(
              `📺 Watch ` +
                (watchHistory.episodeId?.slug == "full"
                  ? "now"
                  : `(Tập ${watchHistory.episodeId.name})`),
              `${process.env.APP_URL}/episode/${movieId}`
            ),
          ],
          [buttonCallback("🔢 Select episode", `episodes,${movieId}`)],
          [buttonSwitchInlineQuery("🔍 Start another searching")],
        ],
      },
      {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
      }
    );
  }
  if (key == "choose_episode" && !!queryData[1]) {
    const episodeId = queryData[1];
    const episode = await Episode.findOne({
      _id: episodeId,
    });
    if (!episode) {
      throw new Error("Episode not found");
    }
    const movie = await movieService.getById(episode?.movie);
    if (!movie) {
      throw new Error("Movie not found");
    }
    const user = await User.findOne({
      userId: query.message?.chat.id,
    });

    await movieService.storeWatchHistory(
      user._id,
      movie._id as string,
      episode.server,
      episode._id
    );
    const watchHistory = await movieService.watchHistory(
      query.message?.chat.id as number,
      movie._id as string
    );
    await telegramBot.editMessageReplyMarkup(
      {
        inline_keyboard: [
          [
            buttonWebApp(
              `📺 Watch ` +
                (watchHistory.episodeId?.slug == "full"
                  ? "now"
                  : `(Tập ${watchHistory.episodeId.name})`),
              `${process.env.APP_URL}/episode/${watchHistory.episodeId._id}`
            ),
          ],
          [buttonCallback("🔢 Select episode", `episodes,${movie._id}`)],
          [buttonSwitchInlineQuery("🔍 Start another searching")],
        ],
      },
      {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
      }
    );
  }
};

export default callbackQueryAction;
