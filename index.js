/** Import **/
const { Telegraf } = require('telegraf');
const { CommandsDao } = require('./db/model/dao/commandDao');
const { registerCommands, registerRoutine } = require('./filters/filter');
require('dotenv').config();

/** Inizializzazione **/
const bot = new Telegraf(process.env.BOT_TOKEN);
global.bot = bot;
registerRoutine(bot);
registerCommands(bot);
bot.launch();

/** Gestione chiusura **/
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
