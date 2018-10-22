const path = require("path");
const DataBase = require(path.join(__dirname, "DataBase.js"));

module.exports = {
    /**
     * Authorize specific id is an owner of linebot or not.
     * @param {string} id A string of a line userId.
     * @returns {Promise<boolean>} This id is owner or not, returns true or false.
     */
    Owner: function (id) {
        return new Promise((resolve, reject) => {
            if (/a-zA-Z0-9/.test(id)) reject('Provided id have some character(s) that is not a number or an english.');
            if (id == undefined) reject('Error: userId is undefined!');
            DataBase.readTable('Owners').then(Owners => resolve(Owners.findIndex(data => data.id == id) > -1));
        });
    }
}