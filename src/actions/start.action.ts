import User from "@/models/user.model";
import TelegramBot from "node-telegram-bot-api";
import { telegramBot, buttonSwitchInlineQuery } from "@/lib/telegram";

const startAction = async (msg: TelegramBot.Message) => {
  await User.findOneAndUpdate(
    {
      userId: msg.from?.id,
    },
    {
      userId: msg.from?.id,
      userName: msg.from?.username,
      firstName: msg.from?.first_name,
      languageCode: msg.from?.language_code,
    },
    {
      upsert: true,
      new: true,
    }
  );
  await telegramBot.sendMessage(
    msg.chat.id,
    `🍿 Hello, movie buff!

🔍 To search, use the buttons below or send a movie title in a message`,
    {
      reply_markup: {
        inline_keyboard: [[buttonSwitchInlineQuery("🔍 Start searching")]],
      },
    }
  );
};

export default startAction;
