import type { NextApiRequest, NextApiResponse } from "next";
import { setWebhook } from "@/lib/telegram";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const url = `${process.env.APP_URL}/api/webhook-telegram`; // Replace YOUR_DOMAIN with your actual domain
  await setWebhook(url);
  res.status(200).json({ message: "Webhook has been set up" });
}
