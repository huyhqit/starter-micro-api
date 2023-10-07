const TelegramBot = require("node-telegram-bot-api");
const { getHistoryPrices } = require("./src/shopee");
const { getFinalUrl } = require("./src/utils/helper");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;
console.log('token')

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/bot [shopee]"
bot.onText(/\/bot https:\/\/shopee.vn(.+)/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const message = `https://shopee.vn${match[1]}`; // the captured "shopee"

  await getHistoryPrices(bot, chatId, message);
});

bot.onText(/\/bot https:\/\/shp.ee(.+)/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  // https://shp.ee/qi6squd

  const chatId = msg.chat.id;
  const pathname = match[1]; // the captured "shopee"

  const link = await getFinalUrl(`https://shp.ee${pathname}`);
  const message = link.config.url;

  await getHistoryPrices(bot, chatId, message);
});

bot.onText(/\/bot https:\/\/shope.ee(.+)/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  // https://shope.ee/8pGUFNo3Yu

  const chatId = msg.chat.id;
  const pathname = match[1]; // the captured "shopee"

  const link = await getFinalUrl(`https://shope.ee${pathname}`);
  const message = link.config.url;

  await getHistoryPrices(bot, chatId, message);
});
