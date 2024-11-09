import type { NextApiRequest, NextApiResponse } from "next";
import { telegramBot } from "@/lib/telegram";
import startAction from "@/actions/start.action";
import connectToDatabase from "@/lib/mongoose";
import callbackQueryAction from "@/actions/callback.action";
import inlineQueryAction from "@/actions/inline.action";
import movieAction from "@/actions/movie.action";

telegramBot.onText(/\/start/, startAction);
telegramBot.on("callback_query", callbackQueryAction);
telegramBot.on("inline_query", inlineQueryAction);
telegramBot.onText(/o(.+)/, movieAction);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "POST") {
    await connectToDatabase();

    if (req.body) {
      telegramBot.processUpdate(req.body);
    }

    res.status(200).send("OK");
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
