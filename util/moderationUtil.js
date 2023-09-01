const { ResponseTypeDao } = require("../db/model/dao/responseTypeDao");
const { Context } = require("telegraf");
const { CommandsDao } = require("../db/model/dao/commandDao");
const { ResponseDao } = require("../db/model/dao/responseDao");
const { Dao } = require("../db/model/dao/dao");
const { StrikeDao } = require("../db/model/dao/strikeDao");
const { AliasDao } = require("../db/model/dao/aliasDao");

let getTarget = async (ctx, help) => {
    let text = String(ctx.message.text);
    let toReturnError = [null, null];
    let reply = ctx.message.reply_to_message;
    let tags = text.match(/@(\w*)/g);
    let mention = ctx.message.entities.find(en=>en.type==="text_mention");
    if (!reply && (!tags || tags.length == 0) && !mention) {
        ctx.reply(help);
        return toReturnError;
    }
    // Index start to substring for description
    let startingIndex = text.indexOf(' ');
    startingIndex = startingIndex == -1 ? text.length : startingIndex;
    let target = {
        userid: -1,
        alias: '',
        username: ''
    };
    // Determining the target
    if (tags && tags.length > 0) {
        try {
            target = await AliasDao.getByUsername (tags[0].slice(1, tags[0].length));
            startingIndex = text.indexOf (' ', startingIndex + 1);
        } catch (ex) {
            console.debug(ex);
            ctx.reply (`Porcodio Andrea fixa sta merda.\n${JSON.stringify(ex)}`);
            return toReturnError;
        }
    } else if (mention) {
        try {
            target = await AliasDao.getByUser (mention.user.id);
            if (!target) {
                target = {
                    userid: mention.user.id,
                    alias: mention.user.first_name,
                    username: mention.user.first_name
                };
            }
            startingIndex = text.indexOf (' ', startingIndex + 1);
        } catch (ex) {
            console.debug(ex);
            ctx.reply (`Porcodio Andrea fixa sta merda.\n${JSON.stringify(ex)}`);
            return toReturnError;
        }
    } else {
        try {
            target = await AliasDao.getByUser (reply.from.id);
            target = {
                userid: reply.from.id,
                alias: reply.from.username || reply.from.first_name,
                username: reply.from.username || reply.from.first_name
            };
        } catch (ex) {
            console.debug(ex);
            ctx.reply (`Porcodio Andrea fixa sta merda.\n${JSON.stringify(ex)}`);
            return toReturnError;
        }
    }
    startingIndex = startingIndex == -1 ? text.length : startingIndex;
    return [target, startingIndex];
}

let addStrike = async (ctx) => {
    let description = "";
    let text = String(ctx.message.text);
    let help = 'Si fa così: rispondi ad un messaggio con /strike <descrizione>.\nAltrimenti, puoi taggare con /strike @utente <descrizione>';
    const [target, startingIndex] = await getTarget (ctx, help);
    // If no source of target found
    if (!target && !startingIndex) return;

    // Try parse description
    try {
        description = text.substring (startingIndex, text.length);
    } catch {
        description = "";
    }

    if (ctx.botInfo.id === target.userid) {
        ctx.reply (`@${ctx.message.from.username || ctx.message.from.first_name} memt.`);
        return;
    }

    try {
        // Validation positive, execute insertion
        let inserted = await StrikeDao.insert (target.userid, description);
        let allTarget = await StrikeDao.allByUser (target.userid, false);
        ctx.reply (`${allTarget.length}ª AMMONIZIONE PER @${target.alias || target.username}`);
    } catch (ex) {
        console.debug(ex);
        ctx.reply (`Porcodio Andrea fixa sta merda.\n${JSON.stringify(ex)}`);
        return;
    }
    
}

let removeStrike = async (ctx) => {
    let text = String(ctx.message.text);
    let help = `Si fa così: rispondi ad un messaggio con /pardon.\nAltrimenti, puoi taggare con /pardon @utente`;
    const [target, startingIndex] = await getTarget (ctx, help);
    // If no source of target found
    if (!target && !startingIndex) return;
    if (ctx.botInfo.id === Number(target.userid)) return;
    try {
        // Validation positive, execute insertion
        let inserted = await StrikeDao.deleteOldestByUserId (target.userid);
        if (inserted.changes > 0) {
            ctx.reply (`Rimossa ammonizione per @${target.alias || target.username}`);
        } else {
            ctx.reply (`Non ci sono ammonizioni per @${target.alias || target.username}`);
        }
    } catch (ex) {
        console.debug(ex);
        ctx.reply (`Porcodio Andrea fixa sta merda.\n${JSON.stringify(ex)}`);
        return;
    }
}

let setAliasUser = async (ctx) => {
    let text = String(ctx.message.text);
    let help = `Si fa così: rispondi ad un messaggio con /alias <nickname>.\nAltrimenti, puoi taggare con /alias @utente <nickname>`;
    const [target, startingIndex] = await getTarget (ctx, help);
    // If no source of target found
    if (!target && !startingIndex) return;
    
    if (ctx.botInfo.id === Number(target.userid)) return;
    // Try parse alias
    let alias = "";
    try {
        alias = text.substring (startingIndex, text.length);
    } catch {
        alias = "";
    }
    if (!alias || alias.length == 0) {
        ctx.reply (`Così no porca madonna. È /alias <utente> <nickname>. In ''${text}'' dove minchia vedi <nickname> ??`)
        return;
    }
    // Try updating or inserting alias
    if (!saveOrInsert (ctx, target.userid, target.username, alias)) {
        console.debug(`[!] User save alias error '${target.username}' [${target.id}]`);
        ctx.reply (`No, non credo che lo farò.`);
    } else {
        ctx.reply (`ATTENZIONE ATTENZIONE @${target.username} d'ora in poi lo chiameremo ${alias.toUpperCase ()}.`);
    }
}

let saveUserRoutine = async (ctx, next) => {
    let user = ctx.message.from;
    if (!saveOrInsert (ctx, user.id, user.username || user.first_name, null)) {
        console.debug(`[!] User save routine error '${user.username || user.first_name}' [${user.id}]`);
    }
    next();
}

let saveOrInsert = async (ctx, userId, username, alias) => {
    let existingAlias = null;
    try {
        existingAlias = await AliasDao.getByUser(userId);
    } catch (ex) {
        console.debug(ex);
        ctx.reply (`Porcodio Andrea fixa sta merda.\n${JSON.stringify(ex)}`);
        return false;
    }
    try {
        // If does not exist, try inserting
        if (!existingAlias) {
            await AliasDao.insert(userId, alias ?? '', username)
        } else {
            await AliasDao.updateByUserId(userId, alias ?? '', username)
        }
    } catch (ex) {
        console.debug(ex);
        return false;
    }
    return true;
}

module.exports = {addStrike, removeStrike, saveUserRoutine, setAliasUser}