import fetch from "node-fetch";
import 'dotenv/config'; // .env سے TOKEN load کرنے کے لیے

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Netlify serverless handler
export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      // Inline keyboard with WebApp button
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "🚀 Start Dex Wallet App",
              web_app: { url: "https://t.me/DPSwallet_bot?startapp" }
            }
          ]
        ]
      };

      // /start command handling
      if (text === "/start") {
        const welcome = `
👋 Welcome to DPS Wallet Bot!

💰 Check your balance
📈 View transactions
🎁 Earn rewards
🔗 Open Web Wallet via the button below
        `;
        await sendMessage(chatId, welcome, keyboard);
      } else {
        await sendMessage(chatId, "Send /start to begin 🚀");
      }
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("Error handling update:", err);
    return { statusCode: 500, body: "Error" };
  }
};

// sendMessage function with optional keyboard
async function sendMessage(chatId, text, keyboard = null) {
  const body = { chat_id: chatId, text };

  if (keyboard) {
    body.reply_markup = keyboard;
  }

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}