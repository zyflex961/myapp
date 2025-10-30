import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // .env میں محفوظ کریں
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      if (text === "/start") {
        const welcome = `
👋 Welcome to DPS Wallet Bot!

You can:
💰 Check your balance
📈 View transactions
🎁 Earn rewards
🔗 Visit Web Wallet: https://walletdps.netlify.app
        `;
        await sendMessage(chatId, welcome);
      } else {
        await sendMessage(chatId, "Send /start to begin 🚀");
      }
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("Error handling update:", err);
    return { statusCode: 500, body: "Error" };
  }
}

async function sendMessage(chatId, text) {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return res.json();
}