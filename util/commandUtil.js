const { ResponseTypeDao } = require("../db/model/dao/responseTypeDao");
const { Context } = require("telegraf");
const { CommandsDao } = require("../db/model/dao/commandDao");
const { ResponseDao } = require("../db/model/dao/responseDao");
const { Dao } = require("../db/model/dao/dao");
const { AliasDao } = require("../db/model/dao/aliasDao");

let insertCommand = async (ctx) => {
    let text = ('' + ctx.message.text);
    // Testo senza /comando
    let isValid = false;
    let command = "";
    let responses;
    let output = "";
    // Try parse /command <commandName> <responses>
    try {
        command = text.substring (text.indexOf(' ', 0) + 1, text.length);
        command = command ? command.toLowerCase() : null;
        responses = command.substring (command.indexOf(' ', 0) + 1, command.length).split(';');
        command = command.substring (0, command.indexOf(' '));
        isValid = command && command.length > 0 && responses.length > 0;
    } catch {
        isValid = false
    }
    
    if (!isValid) {
        ctx.reply ('Si fa così: /add <comando> <risposte separate da ;>');
        return;
    }
    try {
        // Validation positive, execute insertion
        // First: check if command exists, in case get id of inserted or existing command
        let commandList = await CommandsDao.getByCommand (command);
        let commandId = commandList.length == 0 ? -1 : commandList[0].id;
        if (commandId == -1) {
            let inserted = await CommandsDao.insert (command);
            commandId = inserted.id;
        } else {
            output += `Il comando '${command}' esiste già, hai l'alzheimer? Aggiungo solo le nuove risposte\r\n`;
        }
        
        let failedResponses = [];

        // Try adding responses
        try {
            for (let res of responses) {
                let inserted = await ResponseDao.insert (commandId, res, ResponseTypeDao.constants.simple);
            }
        } catch (err) {
            failedResponses.push (res);
        }

        if (failedResponses.length > 0) {
            output += `Le seguenti risposte non le ho potute salvare: \r\n`;
            failedResponses.forEach((res, index) => {output += ` ${index + 1}) ${res}`;}) 
        } else {
            output += `Aggiunto ${responses.length} risposte.`;
        }

        try {
            let toRegister = createSimpleResponse (command, responses);
            global.bot.command(toRegister.command, toRegister.action);
            console.debug(`Registered command [${toRegister.command}]`);
        } catch (err) {
            ctx.reply (`Non è stato possibile registrare il comando. Riavviami per utilizzare /${command}.`);
            return;
        }
        

        ctx.reply (output);
    } catch (ex) {
        console.log(ex);
        ctx.reply (`Porcodio Andrea fixa sta merda.\n${JSON.stringify(ex)}`);
        return;
    }
    
}

let deleteCommand = async (ctx) => {
    let text = ('' + ctx.message.text);
    let command = "";
    let isValid = false;
    try {
        command = text.substring (text.indexOf(' ', 0) + 1, text.length);
        command = command ? command.toLowerCase() : null;
        isValid = command && command.length > 0;
    } catch {
        isValid = false;
    }
    if (!isValid) {
        ctx.reply ('Guarda che la sintassi è /delete <comando>, non quella cacata.');
        return;
    }
    // Check if command exists
    let comLst = await CommandsDao.getByCommand (command);
    if (comLst.length == 0) {
        ctx.reply ('Sto comando è come tuo padre, non c\'è');
        return;
    }
    // Try delete
    try {
        let changes = await CommandsDao.deleteByCommand (command);
        let removedResponses = await ResponseDao.deleteByCommandId (comLst[0].id);
        if (changes.changes == 0) {
            ctx.reply (`In qualche maniera il comando esiste, ma non ho potuto eliminarlo (CodErrore: Gi0n4t4)`);
        } else {
            console.debug(`Deleted command [${command}] (${changes.changes} - ${removedResponses.changes})`)
            global.deleted = global.bot.deleted ? global.bot.deleted : [];
            global.deleted.push (command);
            ctx.reply (`Eliminato il comando ${command} e rimosse ${removedResponses.changes} risposte.`);
        }
    } catch (err) {
        ctx.reply (`Possiamo dare una ammonizione ad Andrea? \n${JSON.stringify(err)}`)
        return;
    }
    
}

let createSimpleResponse = (command, responses) => {
    let simpleResponse = async (ctx) => {
        if (global.deleted && global.deleted.includes (command)) {return;}
        let answerTxt = responses[Math.floor(Math.random() * responses.length)];
        if (ctx.message.reply_to_message) {
            const originalUser = ctx.message.reply_to_message.from;
            const mention = await AliasDao.getAliasByIdSafe(originalUser.id, '@' + originalUser.username || originalUser.first_name)
            ctx.reply(`${mention} ${answerTxt}`);
        } else {
            ctx.reply(answerTxt);
        }
    }
    return {command: command, action: simpleResponse}
}

/**
 * Recupera tutti i comandi personalizzati
 * @param {Context} ctx 
 */
let getAllCommands = async (ctx) => {
    let rows = CommandsDao.all().then(rows=>{
        let toReturn = '';
        if (rows.length == 0) {
            toReturn = `Per ora sono ancora lobotomizzato. Prova ad usare /add`;
        } else {
            toReturn = `Lista comandi:\n${rows.map(row=>{return ` ${row.command}`})}`;
        }
        ctx.reply(toReturn);
    }).catch ((err)=>ctx.reply('Non è stato possibile recuperare comandi. Trmò'));
}

module.exports = {insertCommand, createSimpleResponse, getAllCommands, deleteCommand}