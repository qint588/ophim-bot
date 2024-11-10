import {
  buttonCallback,
  buttonSwitchInlineQuery,
  buttonWebApp,
  telegramBot,
} from "@/lib/telegram";
import { ICategory } from "@/models/category.model";
import { ICountry } from "@/models/country.model";
import { IMovie } from "@/models/movie.model";
import movieService from "@/services/movie.service";
import TelegramBot from "node-telegram-bot-api";

const generateStatus = (status: string) => {
  if (status == "ongoing") {
    return "Đang cập nhật";
  }
  if (status == "completed") {
    return "Hoàn thành";
  }
  return status;
};

const generateCaption = (movie: IMovie) => {
  const categories = movie.categories as ICategory[];
  const countries = movie.countries as ICountry[];

  let caption = `${movie.name} (${movie.originalName})\n\n`;
  caption += `👉 Thể loại: ${categories.map((el) => el.name).join(", ")}\n`;
  caption += `👉 Quốc gia: ${countries.map((el) => el.name).join(", ")}\n`;
  caption += `👉 Thời gian: ${movie.time}\n`;
  caption += `👉 Năm: ${movie.year}\n`;
  caption += `👉 Ngôn ngữ: ${movie.lang}\n`;
  caption += `👉 Trạng thái: ${generateStatus(movie.status)}\n\n`;
  caption += `@${process.env.TELEGRAM_BOT_USERNAME}`;
  return caption;
};

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
    const caption = generateCaption(movie);
    telegramBot.sendPhoto(msg.chat.id, movie.porsterUrl as string, {
      caption,
      reply_markup: {
        inline_keyboard: [
          [
            buttonWebApp(
              `📺 Xem ` +
                (watchHistory.episodeId?.slug == "full"
                  ? "now"
                  : `(Tập ${watchHistory.episodeId.name})`),
              `${process.env.APP_URL}/episode/${watchHistory.episodeId._id}`
            ),
          ],
          [buttonCallback("🔢 Chọn tập", `episodes,${movie._id}`)],
          [buttonSwitchInlineQuery("🔍 Bắt đầu tìm kiếm khác")],
        ],
      },
    });
  } catch (error) {
    console.log(error);

    telegramBot.sendMessage(
      msg.chat.id,
      `⚠️ Rất tiếc, chúng tôi không tìm thấy phim bạn yêu cầu. Bạn có thể xem thêm phim bằng cách nhấp vào nút "bắt đầu tìm kiếm".`,
      {
        reply_markup: {
          inline_keyboard: [[buttonSwitchInlineQuery("🔍 Bắt đầu tìm kiếm")]],
        },
      }
    );
  }
};

export default movieAction;
