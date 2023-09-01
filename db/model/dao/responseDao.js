let {getWriteConnection, getReadConnection} = require ('../../connection.js');
const { CommandsDao } = require('./commandDao.js');
const {Dao} = require('./dao.js');
const sqlite3 = require('sqlite3');
const { ResponseTypeDao } = require('./responseTypeDao.js');

class ResponseDao extends Dao {
    constructor () {
        super()
    }

    static get table() {
        return "responses";
    }

    static get fields () { 
        return {
            id: {primary: true, name: 'id', type: 'integer'},
            command: {primary: false, name: 'command', type: 'integer'},
            response: {primary: false, name: 'response', type: 'text'},
            type: {primary: false, name: 'type', type: 'integer'},   
        }
    }

    static get insertableFields () {
        return [this.fields.command.name, this.fields.response.name, this.fields.type.name].join(', ');
    }

    static get printableFields () {
        return [this.fields.id.name, this.fields.command.name].join(', ');
    }
     
    static async insert (command, response, type) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.get(`INSERT INTO ${ResponseDao.table} (${ResponseDao.insertableFields}) values (?, ?, ?) RETURNING ${ResponseDao.allFields}`, [command, response, type], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close();
        })
    }

    static async simpleResponses () {
        return new Promise(async function(resolve, reject){
            const db = await getReadConnection ();
            await db.all(`SELECT com.${CommandsDao.fields.command.name}, GROUP_CONCAT (res.${ResponseDao.fields.response.name}, '${Dao.separator}') AS ${ResponseDao.fields.response.name} FROM ${ResponseDao.table} res inner join ${CommandsDao.table} com on res.${ResponseDao.fields.command.name} = com.${CommandsDao.fields.id.name} where res.${ResponseDao.fields.type.name} = ${ResponseTypeDao.constants.simple} GROUP BY com.${CommandsDao.fields.command.name}`, [], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            })
            db.close();
        })
    }
    
    static async all (complete) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.all(`SELECT ${complete ? ResponseDao.allFields : ResponseDao.printableFields} FROM ${ResponseDao.table} `, [], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close();
        })
    }

    static async deleteByCommandId (commandId) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.run(`DELETE FROM ${ResponseDao.table} WHERE ${ResponseDao.fields.command.name} = ?`, [commandId], function(err){
                if (err) {
                    reject (err);
                } else {
                    resolve (this);
                }
            });
            db.close();
        })
    }
}

module.exports = {ResponseDao}