class Dao {
    constructor () {}
    static get fields () { return {} }
    static get allFields () { return Object.keys(this.fields).map(key=>this.fields[key].name).join(', ')}
    static get separator () { return '_;_'; }
}

module.exports = {Dao}