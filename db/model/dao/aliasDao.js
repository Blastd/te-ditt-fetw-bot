let {getWriteConnection, getReadConnection} = require ('../../connection.js');
const { CommandsDao } = require('./commandDao.js');
const {Dao} = require('./dao.js');
const sqlite3 = require('sqlite3');
const { ResponseTypeDao } = require('./responseTypeDao.js');

class AliasDao extends Dao {
    constructor () {
        super()
    }

    static get table() {
        return "aliases";
    }

    static get fields () { 
        return {
            user: {primary: true, name: 'userid', type: 'integer'},
            alias: {primary: false, name: 'alias', type: 'text'},
            username: {primary: false, name: 'username', type: 'text'},
        }
    }

    static get insertableFields () {
        return [this.fields.user.name, this.fields.alias.name, this.fields.username.name].join(', ');
    }

    static get printableFields () {
        return [this.fields.user.name, this.fields.alias.name, this.fields.username.name].join(', ');
    }
     
    static async insert (user, alias, username) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.get(`INSERT INTO ${AliasDao.table} (${AliasDao.insertableFields}) values (?, ?, ?) RETURNING ${AliasDao.allFields}`, [user, alias, username], function(err, row){
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
            await db.all(`SELECT ${complete ? AliasDao.allFields : AliasDao.printableFields} FROM ${AliasDao.table} `, [], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close ();
        })
    }

    static async getByUser (userId, complete) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.get(`SELECT ${complete ? AliasDao.allFields : AliasDao.printableFields} FROM ${AliasDao.table} WHERE ${AliasDao.fields.user.name} = ?`, [userId], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close ();
        })
    }

    static async getIdByUsername (username) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.get(`SELECT ${AliasDao.fields.user.name} FROM ${AliasDao.table} WHERE ${AliasDao.fields.username.name} = ?`, [username], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close ();
        })
    }

    static async getAliasByUsername (username) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.get(`SELECT ${AliasDao.fields.alias.name} FROM ${AliasDao.table} WHERE ${AliasDao.fields.username.name} = ?`, [username], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close ();
        })
    }

    static async getAliasSafe (username) {
        try {
            return await this.getAliasByUsername(username) ?? username;
        } catch (err) {
            console.warn (`Suppressed exception: ${err}`);
            return username;
        }
    }

    static async getAliasByIdSafe (userId, fallback) {
        try {
            let toReturn = (await this.getByUser(userId)).alias ?? fallback;
            toReturn = toReturn.length == 0 ? fallback : toReturn;
            return toReturn;
        } catch (err) {
            console.warn (`Suppressed exception: ${err}`);
            return fallback;
        }
    }

    static async getByUsername (username) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.get(`SELECT ${AliasDao.allFields} FROM ${AliasDao.table} WHERE ${AliasDao.fields.username.name} = ?`, [username], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close ();
        })
    }

    static async updateByUserId (userId, alias, username) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            const aliasValid = alias && alias.length > 0;
            const usernameValid = username && username.length > 0;
            let toAdd = [];
            if (aliasValid) toAdd.push (alias);
            if (usernameValid) {
                await db.run(`UPDATE ${AliasDao.table} SET ${AliasDao.fields.username.name} = '' WHERE ${AliasDao.fields.username.name} = ?`, [username])
                toAdd.push (username);
            }
            toAdd.push (userId);
            if (!aliasValid && !usernameValid) return {changes: 0};
            await db.run(`UPDATE ${AliasDao.table} SET ${aliasValid ? `${AliasDao.fields.alias.name} = ?` : ''} ${usernameValid && aliasValid ? ',' : ''} ${usernameValid ? `${AliasDao.fields.username.name} = ?` : ''} WHERE ${AliasDao.fields.user.name} = ?`, toAdd, function(err){
                if (err) {
                    reject (err);
                } else {
                    resolve (this);
                }
            });
            db.close ();
        })
    }

    static async deleteByUserId (userId) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.run(`DELETE FROM ${AliasDao.table} WHERE ${AliasDao.fields.user.name} = ?`, [userId], function(err){
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

module.exports = {AliasDao}