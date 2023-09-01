const { CommandsDao } = require("../../db/model/dao/commandDao");
const { ResponseDao } = require("../../db/model/dao/responseDao");
const { Dao } = require("../../db/model/dao/dao");
const { addStrike, saveUserRoutine, removeStrike, setAliasUser } = require("../../util/moderationUtil");

async function getCommandList() {
    let toReturn = [
        {command: 'strike', action: addStrike, admin: true},
        {command: 'pardon', action: removeStrike, admin: true},
        {command: 'alias', action: setAliasUser, admin: true}
    ];
    return toReturn;
}

async function getRoutineList() {
    let toReturn = [
        {routine: 'text', action: saveUserRoutine},
        {routine: 'new_chat_members', action: saveUserRoutine}
    ];
    return toReturn;
}

module.exports = {getCommandList, getRoutineList}