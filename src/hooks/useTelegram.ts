// src/hooks/useTelegram.ts
import { useEffect, useState } from "react";
import { TelegramWebApp } from "../types/telegram-webapp";

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      tgWebApp.expand();
      setWebApp(tgWebApp);

      //@ts-expect-error: Hidden error
      setHeight(tgWebApp.viewportStableHeight || window.innerHeight);
      //@ts-expect-error: Hidden error
      tgWebApp.onEvent("viewportChanged", () => {
        //@ts-expect-error: Hidden error
        setHeight(tgWebApp.viewportStableHeight || window.innerHeight);
      });
    }
  }, []);

  const closeWebApp = () => webApp?.close();
  const showMainButton = (text: string) => {
    if (webApp) {
      webApp.MainButton.text = text;
      webApp.MainButton.show();
    }
  };

  return {
    webApp,
    closeWebApp,
    showMainButton,
    themeParams: webApp?.themeParams,
    initDataUnsafe: webApp?.initDataUnsafe,
    height,
  };
}
