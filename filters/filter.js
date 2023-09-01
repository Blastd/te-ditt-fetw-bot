const { Telegraf } = require("telegraf");
const commandList = require("./list/commandList");
const moderationList = require("./list/moderationList");
const { message } = require('telegraf/filters');

/**
* Registra i comandi ai bot
* @param {Telegraf} bot 
*/
async function registerCommands (bot) {
    let commands = [
        ...await commandList.getCommandList (),
        ...await moderationList.getCommandList ()
    ];
    for (let com of commands) {
        if (com.admin) {
            bot.command(com.command, isAdmin, com.action);
        } else {
            bot.command(com.command, com.action);
        }
        
        console.debug(`Registered command [${com.command}]`);
    }
    console.debug("All commands registered");
}

async function registerRoutine (bot) {
    let routines = [
        ...await moderationList.getRoutineList ()
    ]
    
    for (let rou of routines) {
        bot.on(message(rou.routine), rou.action);
        console.debug(`Registered routine [${rou.routine}]`);
    }
    console.debug("All routines registered");
}

async function isAdmin (ctx, next) {
    try {
        const chatId = ctx.message.chat.id;
        const userId = ctx.message.from.id;
        
        // Get the chat member information for the user
        const chatMember = await ctx.telegram.getChatMember(chatId, userId);
        
        // Check if the user is an admin
        if (chatMember.status === 'administrator' || chatMember.status === 'creator') {
            // User is an admin, proceed to the next middleware
            return next();
        } else {
            // User is not an admin, reply with a message or take appropriate action
            return;
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = {registerCommands, registerRoutine}