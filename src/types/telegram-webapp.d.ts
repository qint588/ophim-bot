// src/types/telegram-webapp.d.ts
export interface TelegramWebApp {
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    query_id?: string;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  MainButton: {
    text: string;
    show(): void;
    hide(): void;
  };
  close(): void;
  expand(): void;
}

// Extend the Window interface to include Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
