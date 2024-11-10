import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Please define the TELEGRAM_BOT_TOKEN environment variable");
}

// @ts-expect-error: Hidden error
let telegramBot: TelegramBot = global.telegramBot;

if (!telegramBot || process.env.APP_ENV == "local") {
  // @ts-expect-error: Hidden error
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

export const buttonSwitchInlineQuery = (
  text: string,
  inline_query: string = ""
): InlineKeyboardButton => {
  return {
    text,
    switch_inline_query_current_chat: inline_query,
  };
};

export const buttonWebApp = (
  text: string,
  url: string
): InlineKeyboardButton => {
  return {
    text,
    web_app: {
      url,
    },
  };
};

export const buttonCallback = (
  text: string,
  callback: string
): InlineKeyboardButton => {
  return {
    text,
    callback_data: callback,
  };
};

export { telegramBot, setWebhook };
