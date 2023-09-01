let {getWriteConnection, getReadConnection} = require ('../../connection.js');
const {Dao} = require('./dao.js');
const sqlite3 = require('sqlite3')

class ResponseTypeDao extends Dao {
    constructor () {
        super()
    }

    static get table() {
        return "responseTypes";
    }

    static get fields () { 
        return {
            id: {primary: true, name: 'id', type: 'integer'},
            description: {primary: false, name: 'description', type: 'text'}
        }
    }

    static get insertableFields () {
        return [this.fields.description.name].join(', ');
    }

    static get printableFields () {
        return [this.fields.id.name, this.fields.description.name].join(', ');
    }

    static get constants () {
        return {
            simple: 1
        }
    }
     
    static async insert (command) {
        return new Promise(async function(resolve, reject){
            const db = await getWriteConnection ();
            await db.get(`INSERT INTO ${ResponseTypeDao.table} (${ResponseTypeDao.insertableFields}) values (?) RETURNING ${ResponseTypeDao.allFields}`, [command], function(err, row){
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
            await db.all(`SELECT ${complete ? ResponseTypeDao.allFields : ResponseTypeDao.printableFields} FROM ${ResponseTypeDao.table} `, [], function(err, row){
                if (err) {
                    reject (err);
                } else {
                    resolve (row);
                }
            });
            db.close();
        })
    }
}

module.exports = {ResponseTypeDao}