let {getWriteConnection, getReadConnection} = require ('../../connection.js');
const {Dao} = require('./dao.js');
const sqlite3 = require('sqlite3')

class CommandsDao extends Dao {
    constructor () {
        super()
    }

    static get table() {
        return "commands";
    }

    static get fields () { 
        return {
            id: {primary: true, name: 'id', type: 'integer'},
            command: {primary: false, name: 'command', type: 'text'}
        }
    }

    static get insertableFields () {
        return [this.fields.command.name].join(', ');
    }

    static get printableFields () {
        return [this.fields.id.name, this.fields.command.name].join(', ');
    }
     
    static async insert (command) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.get(`INSERT INTO ${CommandsDao.table} (${CommandsDao.insertableFields}) values (?) RETURNING ${CommandsDao.allFields}`, [command], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close();
        })
    }
    
    static async all (complete) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.all(`SELECT ${complete ? CommandsDao.allFields : CommandsDao.printableFields} FROM ${CommandsDao.table} `, [], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close();
        })
    }

    static async getByCommand (command) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.all(`SELECT ${CommandsDao.allFields} FROM ${CommandsDao.table} WHERE ${CommandsDao.fields.command.name} = ?`, [command], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close();
        })
    }

    static async deleteByCommand (command) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.run(`DELETE FROM ${CommandsDao.table} WHERE ${CommandsDao.fields.command.name} = ?`, [command], function(err){
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

module.exports = {CommandsDao}