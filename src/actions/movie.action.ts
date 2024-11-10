import {
  buttonCallback,
  buttonSwitchInlineQuery,
  buttonWebApp,
  telegramBot,
} from "@/lib/telegram";
import movieService from "@/services/movie.service";
import TelegramBot, { ChatId } from "node-telegram-bot-api";

const movieAction = async (
  msg: TelegramBot.Message,
  match: RegExpExecArray | null
) => {
  try {
    const movieId = match ? match[1] : "";
    const movie = await movieService.getById(movieId);
    if (!movie) {
      throw new Error("Movie not found");
    }
    const watchHistory = await movieService.watchHistory(
      msg.chat.id,
      movie._id as string
    );
    let caption = `${movie.name} (${movie.originalName})\n\n`;
    caption += `👉 Categories: ${movie.categories
      .map((el: any) => el.name)
      .join(",")}\n`;
    caption += `👉 Countries: ${movie.countries
      .map((el: any) => el.name)
      .join(",")}\n`;
    caption += `👉 Time: ${movie.time}\n`;
    caption += `👉 Year: ${movie.year}\n`;
    caption += `👉 Language: ${movie.lang}\n`;
    caption += `👉 Status: ${movie.status}\n\n`;
    caption += `@${process.env.TELEGRAM_BOT_USERNAME}`;
    telegramBot.sendPhoto(msg.chat.id, movie.porsterUrl as string, {
      caption,
      reply_markup: {
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
    });
  } catch (error) {
    console.log(error);

    telegramBot.sendMessage(
      msg.chat.id,
      `⚠️ Sorry, we couldn't find the movie you requested. You can see more movies by clicking the "start search" button.`,
      {
        reply_markup: {
          inline_keyboard: [[buttonSwitchInlineQuery("🔍 Start searching")]],
        },
      }
    );
  }
};

export default movieAction;
