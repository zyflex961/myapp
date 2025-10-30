import fetch from "node-fetch";
import 'dotenv/config';
import fs from "fs";
import path from "path";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// JSON file path for storing users
const usersFilePath = path.join(process.cwd(), "users.json");

// Helper function to read users from file
function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return []; // If file doesn't exist or invalid, return empty array
  }
}

// Helper function to save users to file
function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      // Save user chat ID if not already saved
      const users = readUsers();
      if (!users.includes(chatId)) {
        users.push(chatId);
        saveUsers(users);
        console.log("New user saved:", chatId);
      }

      // Inline keyboard with WebApp button
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "🚀 Start App",
              web_app: { url: "https://t.me/DPSwallet_bot?startapp" }
            }
          ]
        ]
      };

      // Handle /start
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