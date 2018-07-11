// packages
const sqlite = require('sqlite');

// ================================================== Start My Program ==================================================

var db_settings;
setTimeout(async function () {
    // Cause app.js located at root directory
    db_settings = await sqlite.open('./database/settings.sqlite', { Promise });
});

module.exports = {
    /**
     * Read an entire table or a specific row in a table from database.
     * @param {string} tableName Table name in database, like: Groups, Owners, Users... etc.
     * @param {string} [id] (Optional) Specific id in a table, such like a groupId.
     * @returns {Promise<Array<JSON>>} An array of JSON format list of specific data, or returns a promise rejection with error.
     */
    readTable: function (tableName, id) {
        return new Promise((resolve, reject) => {
            if (/\s/.test(tableName)) reject('tableName have whitespace(s).');
            if (/\s/.test(id)) reject('id have whitespace(s).');
            try {
                console.log('SELECT * FROM ' + tableName + (id ? ' WHERE id="' + id + '"' : ''));
                setTimeout(() => db_settings.all('SELECT * FROM ' + tableName + (id ? ' WHERE id="' + id + '"' : '')).then(data => resolve(data)).catch(error => reject(error)), db_settings ? 0 : 2000);
            } catch (error) {
                // When database is not ready for I/O.
                reject(error);
            }
        });
    },
    /**
     * Insert value(s) into a table.
     * @param {string} tableName Table name in database, like: Groups, Owners, Users... etc.
     * @param {string | Array<string>} value Value(s) to be update, can be an array or a string.
     * @example "Value To Insert" || ["Value1", "Value2", "Value3"]
     * @returns {Promise<boolean>} Promise resolve with a parameter of true, or returns a promise rejection with error.
     */
    insertValue: function (tableName, value) {
        return new Promise((resolve, reject) => {
            if (/\s/.test(tableName)) reject('tableName have whitespace(s).');
            let valueToInsert = "";
            if (typeof (value) == 'object') {
                valueToInsert = value[0];
                for (let i = 1; i < value.length; i++) valueToInsert += '", ' + value[i];
            } else {
                if (value.includes('"')) value = value.replace('"', '');
                // if (value.includes(',')) {
                //     value = value.replace(/ , /g, ',').replace(/, /g, ',').replace(/ ,/g, ',').split(',');
                //     valueToInsert = value[0];
                //     for (let i = 1; i < value.length; i++) valueToInsert += '", ' + value[i];
                // } else valueToInsert = value;
                valueToInsert = value;
            }
            // Start insert values.
            try {
                console.log('INSERT INTO ' + tableName + ' VALUES ("' + valueToInsert + '")');
                setTimeout(() => db_settings.run('INSERT INTO ' + tableName + ' VALUES ("' + valueToInsert + '")').catch(error => error ? reject(error) : resolve(true)), db_settings ? 0 : 2000);
            } catch (error) {
                // When database is not ready for I/O.
                reject(error);
            }
        });
    },
    /**
     * Update value(s) in a table.
     * @param {string} tableName Table name in database, like: Groups, Owners, Users... etc.
     * @param {string} id Specific id in a table, such like a groupId.
     * @param {JSON} formattedData If there have a data in JSON format, put it here; else, leave it empty ("").
     * @param {string | Array<string>} [columnName] Specific column to update, can be an array or a string.
     * @example ["columnName1", "columnName2", "columnName3"] || "columnName"
     * @param {string | Array<string>} [value] Value(s) to be update, can be an array or a string.
     * @example ["Value1", "Value2", "Value3"] || "Value To Update"
     * @example updateValue("EarthquakeNotification", "U4af4980629...", "", "area", "新北市");
     * @example updateValue("EarthquakeNotification", "U4af4980629...", {"area": "新北市"});
     * @returns {Promise<boolean>} Promise resolve with a parameter of true, or returns a promise rejection with error.
     */
    updateValue: function (tableName, id, formattedData, columnName, value) {
        return new Promise((resolve, reject) => {
            if (/\s/.test(tableName)) reject('tableName have whitespace(s).');
            if (/\s/.test(id)) reject('id have whitespace(s).');
            let valueToUpdate = "";
            if (formattedData && formattedData != "") {
                try {
                    switch (typeof (formattedData)) {
                        case 'object':
                            formattedData = JSON.parse(JSON.stringify(formattedData));
                            break;
                        case 'string':
                            formattedData = JSON.parse(formattedData);
                            break;
                    }
                    for (let key in formattedData) {
                        valueToUpdate += ', ' + key + '="' + formattedData[key] + '"';
                    }
                    valueToUpdate = valueToUpdate.replace(', ', "");
                } catch (error) {
                    if (error) reject('JSON data format doesn\'t currect!');
                }
            } else {
                switch (typeof (columnName)) {
                    case 'object':
                        valueToUpdate = columnName[0] + '="' + value[0] + '"';
                        for (let i = 1; i < columnName.length; i++) valueToUpdate += ', ' + columnName[i] + '="' + value[i] + '"';
                        break;
                    case 'string':
                        if (/\s/.test(columnName)) reject('columnName have whitespace(s).');
                        if (columnName.includes('"')) columnName = columnName.replace('"', '');
                        if (value.includes('"')) value = value.replace('"', '');
                        // if (columnName.includes(',') && value.includes(',')) {
                        //     columnName = columnName.replace(/ , /g, ',').replace(/ , /g, ',').replace(/, /g, ',').replace(/ ,/g, ',').split(',');
                        //     value = value.replace(/ , /g, ',').replace(/, /g, ',').replace(/ ,/g, ',').split(',');
                        //     valueToUpdate = columnName[0] + '="' + value[0] + '"';
                        //     for (let i = 1; i < columnName.length; i++) valueToUpdate += ', ' + columnName[i] + '="' + value[i] + '"';
                        // } else valueToUpdate = columnName + '="' + value + '"';
                        valueToUpdate = columnName + '="' + value + '"';
                        break;
                    default:
                        reject('Value type is not accepted.');
                        break;
                }
            }
            try {
                console.log('UPDATE ' + tableName + ' SET ' + valueToUpdate + ' WHERE id="' + id + '"');
                setTimeout(() => db_settings.run('UPDATE ' + tableName + ' SET ' + valueToUpdate + ' WHERE id="' + id + '"').catch(error => error ? reject(error) : resolve(true)), db_settings ? 0 : 2000);
            } catch (error) {
                // When database is not ready for I/O.
                reject(error);
            }
        });
    },
    /**
     * Remove a specific row in a table from database.
     * @param {string} tableName Table name in database, like: Groups, Owners, Users... etc.
     * @param {string} id Specific id in a table, such like a groupId.
     * @returns {Promise<boolean>} Promise resolve with a parameter of true, or returns a promise rejection with error.
     */
    deleteWithId: function (tableName, id) {
        return new Promise((resolve, reject) => {
            if (/\s/.test(tableName)) reject('tableName have whitespace(s).');
            if (/\s/.test(id)) reject('id have whitespace(s).');
            try {
                console.log('DELETE FROM ' + tableName + ' WHERE id="' + id + '"');
                setTimeout(() => db_settings.run('DELETE FROM ' + tableName + ' WHERE id="' + id + '"').catch(error => error ? reject(error) : resolve(true)), db_settings ? 0 : 2000);
            } catch (error) {
                reject(error);
            }
        });
    }
}