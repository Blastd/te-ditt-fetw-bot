const { CommandsDao } = require("../../db/model/dao/commandDao");
const { ResponseDao } = require("../../db/model/dao/responseDao");
const { Dao } = require("../../db/model/dao/dao");
const { getAllCommands, insertCommand, deleteCommand, createSimpleResponse } = require("../../util/commandUtil");

async function getCommandList() {
    let toReturn = [
        {command: 'all', action: getAllCommands},
        ...await getSimpleResponses(),
        {command: 'add', action: insertCommand},
        {command: 'delete', action: deleteCommand}
    ];
    return toReturn;
}

module.exports = {getCommandList}

/**
 * Recupera tutti i comandi con risposta semplice
 */
let getSimpleResponses = async () => {
    let toReturn = [];
    let rows = await ResponseDao.simpleResponses()
    for (let row of rows) {
        let responses = ('' + row[ResponseDao.fields.response.name]).split(Dao.separator);
        let command = row[CommandsDao.fields.command.name];
        toReturn.push (createSimpleResponse(command, responses));
    }
    return toReturn;
}