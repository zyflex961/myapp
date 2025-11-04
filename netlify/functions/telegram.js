import fetch from 'node-fetch';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const usersFilePath = path.join(process.cwd(), 'users.json');

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    if (!body.message) return { statusCode: 200, body: 'OK' };

    const chatId = body.message.chat.id;
    const text = body.message.text;
    const users = readUsers();

    if (!users.includes(chatId)) {
      users.push(chatId);
      saveUsers(users);
      console.log('New user saved:', chatId);
    }

    const keyboard = {
      inline_keyboard: [[{ text: '🚀 Start App', web_app: { url: 'https://t.me/DPSwallet_bot?startapp' } }]],
    };
    if (text === '/start') {
      await sendMessage(
        chatId,
        '👋 Welcome to DPS Wallet Bot!\n\n💰 Check balance\n📈 Transactions\n🎁 Earn rewards\n🔗 Open Web Wallet below',
        keyboard,
      );
    } else {
      await sendMessage(chatId, 'Send /start to begin 🚀');
    }

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('Error handling update:', err);
    return { statusCode: 500, body: 'Error' };
  }
}

async function sendMessage(chatId, text, keyboard = null) {
  const body = { chat_id: chatId, text };
  if (keyboard) body.reply_markup = keyboard;

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return res.json();
}
