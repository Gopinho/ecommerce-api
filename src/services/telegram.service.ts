import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

export async function sendTelegramMessage(message: string) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram config missing');
    return;
  }
  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, message);
    console.log(`Telegram message sent: ${message}`);
  } catch (err) {
    console.error('Telegram error:', err);
  }
}