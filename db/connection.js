const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
const DEFAULT = process.env.DS_MAIN;
/**
 * Crea una connessione in lettura con un datasource specifico
 * @param {String} datasource 
 * @param {Function} callback 
 * @returns {sqlite3.Database}
 */
function getReadConnectionDs (datasource, callback) {
    return new sqlite3.Database (datasource, sqlite3.OPEN_READONLY, callback);
}

/**
 * Crea una connessione in scrittura con un datasource specifico
 * @param {String} datasource 
 * @param {Function} callback 
 * @returns {sqlite3.Database}
 */
function getWriteConnectionDs (datasource, callback) {
    return new sqlite3.Database (datasource, sqlite3.OPEN_READWRITE, callback);
}

/**
 * Crea una connessione in lettura con il datasource predefinito
 * @param {Function} callback 
 * @returns {sqlite3.Database}
 */
function getReadConnection (callback) {
    return new sqlite3.Database (DEFAULT, sqlite3.OPEN_READONLY, callback);
}

/**
 * Crea una connessione in scrittura con il datasource predefinito
 * @param {Function} callback 
 * @returns {sqlite3.Database}
 */
function getWriteConnection (callback) {
    return new sqlite3.Database (DEFAULT, sqlite3.OPEN_READWRITE, callback);
}

module.exports = {getReadConnection, getWriteConnection, getReadConnectionDs, getWriteConnectionDs};