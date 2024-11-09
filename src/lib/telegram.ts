import TelegramBot from "node-telegram-bot-api";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Please define the TELEGRAM_BOT_TOKEN environment variable");
}

// @ts-ignore
let telegramBot: TelegramBot = global.telegramBot;

if (!telegramBot || process.env.APP_ENV == "local") {
  // @ts-ignore
  telegramBot = global.telegramBot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
    polling: false,
  });
}

const setWebhook = async (url: string) => {
  try {
    await telegramBot.setWebHook(url);
    console.log(`Webhook has been set at: ${url}`);
  } catch (error) {
    console.error("Error setting webhook:", error);
  }
};

export { telegramBot, setWebhook };
