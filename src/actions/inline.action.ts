import { telegramBot } from "@/lib/telegram";
import MovieService from "@/services/movie.service";
import TelegramBot, { InlineQueryResult } from "node-telegram-bot-api";

const inlineQueryAction = async (query: TelegramBot.InlineQuery) => {
  const limit = 20;
  const offset: number = query.offset ? parseInt(query.offset, 10) : 0;
  const page = offset / limit + 1;

  const movies = await MovieService.search({
    keyword: query.query,
    page,
    limit,
  });

  const inlineQueryResult =
    page == 1 && movies.length == 0
      ? [
          {
            id: "nocontent",
            type: "article",
            title: "No results found 😓",
            input_message_content: {
              message_text: "/search",
            },
            description: "⚠️ If it doesn't work, read the instructions.",
          },
        ]
      : movies.map((el) => {
          return {
            id: el._id,
            type: "article",
            title: el.name,
            input_message_content: {
              message_text: `o${el._id}`,
            },
            thumb_url: el.porsterUrl,
            thumb_height: 100,
            thumb_width: 100,
            description: `${el.episodeCurrent} - Year: ${el.year}`,
          };
        });

  await telegramBot.answerInlineQuery(
    query.id,
    inlineQueryResult as InlineQueryResult[],
    {
      cache_time: 1,
      next_offset: `${page * limit}`,
    }
  );
};

export default inlineQueryAction;
