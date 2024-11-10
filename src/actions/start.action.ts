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
    `🍿 Xin chào, người mê phim!

🔍 Để tìm kiếm, hãy sử dụng các nút bên dưới hoặc gửi tiêu đề phim trong tin nhắn`,
    {
      reply_markup: {
        inline_keyboard: [[buttonSwitchInlineQuery("🔍 Start searching")]],
      },
    }
  );
};

export default startAction;
