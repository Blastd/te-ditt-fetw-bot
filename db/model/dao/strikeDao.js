let {getWriteConnection, getReadConnection} = require ('../../connection.js');
const { CommandsDao } = require('./commandDao.js');
const {Dao} = require('./dao.js');
const sqlite3 = require('sqlite3');
const { ResponseTypeDao } = require('./responseTypeDao.js');

class StrikeDao extends Dao {
    constructor () {
        super()
    }

    static get table() {
        return "strikes";
    }

    static get fields () { 
        return {
            id: {primary: true, name: 'id', type: 'integer'},
            user: {primary: false, name: 'userid', type: 'integer'},
            description: {primary: false, name: 'description', type: 'text'},  
        }
    }

    static get insertableFields () {
        return [this.fields.user.name, this.fields.description.name].join(', ');
    }

    static get printableFields () {
        return [this.fields.user.name, this.fields.description.name].join(', ');
    }
     
    static async insert (user, description) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.get(`INSERT INTO ${StrikeDao.table} (${StrikeDao.insertableFields}) values (?, ?) RETURNING ${StrikeDao.allFields}`, [user, description], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close ();
        })
    }
    
    static async all (complete) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.all(`SELECT ${complete ? StrikeDao.allFields : StrikeDao.printableFields} FROM ${StrikeDao.table} `, [], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close ();
        })
    }

    static async allByUser (userId, complete) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.all(`SELECT ${complete ? StrikeDao.allFields : StrikeDao.printableFields} FROM ${StrikeDao.table} WHERE ${StrikeDao.fields.user.name} = ? ORDER BY ${StrikeDao.fields.id.name} ASC`, [userId], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close ();
        })
    }

    static async deleteByUserId (userId) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.run(`DELETE FROM ${StrikeDao.table} WHERE ${StrikeDao.fields.user.name} = ?`, [userId], function(err){
                if (err) {
                    reject (err);
                } else {
                    resolve (this);
                }
            });
            db.close ();
        })
    }

    static async deleteOldestByUserId (userId) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.run(`DELETE FROM ${StrikeDao.table} WHERE ${StrikeDao.fields.id.name} = (SELECT ${StrikeDao.fields.id.name} from ${StrikeDao.table} WHERE ${StrikeDao.fields.user.name} = ? ORDER BY ${StrikeDao.fields.id.name} ASC LIMIT 1)`, [userId], function(err){
                if (err) {
                    reject (err);
                } else {
                    resolve (this);
                }
            });
            db.close ();
        })
    }

    static async deleteById (id) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.run(`DELETE FROM ${StrikeDao.table} WHERE ${StrikeDao.fields.id.name} = ?`, [id], function(err){
                if (err) {
                    reject (err);
                } else {
                    resolve (this);
                }
            });
            db.close ();
        })
    }
}

module.exports = {StrikeDao}