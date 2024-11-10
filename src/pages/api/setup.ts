import type { NextApiRequest, NextApiResponse } from "next";
import { setWebhook } from "@/lib/telegram";

interface Response {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const url = `${process.env.APP_URL}/api/webhook-telegram`; // Replace YOUR_DOMAIN with your actual domain
  await setWebhook(url);
  res.status(200).json({ message: "Webhook has been set up" });
}
