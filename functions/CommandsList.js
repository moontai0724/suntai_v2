const fs = require('fs');

var commands = { name: 'commands', type: 'floder', data: undefined };

/**
 * Read full file list of a path, and require all file.
 * When floder name include '-' character, means the string after '-' character is a default command that will execute when use command of floder name.
 * @example Floder Name: ST-Help, command: /st. This will automatically redirected to /st help
 * @param {string} path A path which need to read.
 * @returns {JSON} Return a JSON format of full command list.
 */
function readPath(path = '') {
    return new Promise(function (resolve) {
        var base = './commands';
        fs.readdir(base + path, async function (err, data) {
            if (!err) {
                let response = {};
                for (let i = 0; i < data.length; i++) {
                    if (data[i].includes('.') && !data[i].startsWith('-')) {
                        response[data[i].split('.')[0].toLowerCase()] = {
                            // Expected value: filename, like: Help
                            name: data[i].split('.')[0],
                            // Default executed command
                            default: data[i].includes('-') ? data[i].split('-')[1] : undefined,
                            // Expected value: lowercase filename, like: help
                            lowerCaseName: data[i].split('.')[0].toLowerCase(),
                            // Expected value: uppercase letter which transferred to lowercase letter in filename, like: h
                            shortName: data[i].split('.')[0].replace(/[^A-Z]/g, '').toLowerCase(),
                            // Parent commands
                            parents: path.split("/").map(value => value.split('-')[0]).join(' ').replace(' ', ''),
                            // Expected value: js
                            type: data[i].split('.')[1].toLowerCase(),
                            data: require('.' + base + path + '/' + data[i])
                        };
                    } else if (!data[i].startsWith('-')) {
                        response[data[i].split('-')[0].toLowerCase()] = {
                            // Expected value: dirname, like: MT
                            name: data[i].split('-')[0],
                            // Default executed command
                            default: data[i].includes('-') ? data[i].split('-')[1] : undefined,
                            // Expected value: lowercase dirname, like: mt
                            lowerCaseName: data[i].split('-')[0].toLowerCase(),
                            // Expected value: uppercase letter which transferred to lowercase letter in dirname, like: mt
                            shortName: data[i].split('-')[0].replace(/[^A-Z]/g, '').toLowerCase(),
                            // Parent commands
                            parents: path.split("/").map(value => value.split('-')[0]).join(' ').replace(' ', ''),
                            type: 'floder',
                            data: await readPath(path + '/' + data[i])
                        };
                    }
                    if (i == data.length - 1) resolve(response);
                }
                if (data.length == 0) resolve(response);
            } else setTimeout(async function () {
                console.log(err);
                resolve(await readPath(path));
            }, 1000);
        });
    });
};

/**
 * To get full commands list and require all js files.
 * @param {string} path A path which need to read.
 * @returns {JSON} A json format list of commands. 
 */
function getCommandsInfo(path = '') {
    return new Promise(async function (resolve) {
        console.log('getCommandsInfo');
        if (commands.data == undefined) commands.data = await readPath(path);
        resolve(commands);
    });
}

/**
 * To check command is currect or not, return a string of valid command.
 * @param {Array<string>} msgs Commands which user send.
 * @param {JSON} parentDirList Parent dir of handling command.
 * @param {Number} commandSequence Which command is handling now?
 * @param {string} previousCommand previus command (leave it empty string '')
 * @returns {string} A string of valid command.
 * @throws {JSON} {type: 'text', text: '404 Command Not Found: (which command)'}
 */
function filterCommands(msgs, parentDirList, commandSequence, previousCommand) {
    return new Promise(async function (resolve, reject) {
        if (previousCommand.startsWith(' ')) previousCommand = previousCommand.replace(' ', '');

        // If no command after a floder command.
        if (msgs[commandSequence] == undefined) {
            if (parentDirList.default != undefined) {
                msgs[commandSequence] = parentDirList.default;
            } else {
                reject('傳送了一個指令集合，請傳送 "/' + previousCommand + ' help" 獲得指令幫助。');
                return 0;
            }
        }

        let nowCommand = msgs[commandSequence].toLowerCase();
        if (parentDirList.data[nowCommand] && parentDirList.data[nowCommand].type == 'js') {
            resolve(previousCommand + ' ' + parentDirList.data[nowCommand].name);
        } else if (parentDirList.data[nowCommand] && parentDirList.data[nowCommand].type == 'floder') {
            resolve(await filterCommands(msgs, parentDirList.data[nowCommand], ++commandSequence, previousCommand + ' ' + parentDirList.data[nowCommand].name).catch(err => reject(err)));
        } else {
            // short command
            for (let key in parentDirList.data) {
                if (parentDirList.data[key].shortName == nowCommand) {
                    if (parentDirList.data[key].type == 'js') {
                        resolve(previousCommand + ' ' + parentDirList.data[key].name);
                        return 0;
                    } else if (parentDirList.data[key].type == 'floder') {
                        resolve(await filterCommands(msgs, parentDirList.data[key], ++commandSequence, previousCommand + ' ' + parentDirList.data[key].name).catch(err => reject(err)));
                        return 0;
                    }
                }
            }

            if (parentDirList.default != undefined) {
                msgs.splice(commandSequence, 1, parentDirList.default);
                resolve(await filterCommands(msgs, parentDirList, commandSequence, previousCommand).catch(err => reject(err)));
                return 0;
            } else {
                reject('404 Command Not Found: /' + previousCommand + ' ' + msgs[commandSequence]);
            }
        }
    });
}

/**
 * Get data of command file.
 * @param {String} commandsString commands to the dir.
 * @example st help
 * @param {JSON} parentDirList parent command dir
 * @example { name: 'st', type: 'floder', data: (JSON object) }
 * @param {Number} commandSequence Which command is handling now?
 * @returns {string} A required data of command js file.
 */
function getCommandsData(commandsString, parentDirList, commandSequence) {
    return new Promise(async function (resolve, reject) {
        console.log('getCommandsData');
        let commandsArray = commandsString.toLowerCase().split(' ');
        if (commandSequence == commandsArray.length - 1) {
            resolve(parentDirList.data[commandsArray[commandSequence]]);
        } else {
            resolve(await getCommandsData(commandsString, parentDirList.data[commandsArray[commandSequence]], ++commandSequence));
        }
    });
}

/**
 * A command to get a list of commands in a floder, but only 1 dir.
 * @param {JSON} parentDirList Parent command dir.
 * @example { name: 'st', type: 'floder', data: (JSON object) }
 * @param {Boolean} onlyParent Only read parent dir or not.
 * @param {String} commandsString Commands to the dir.
 * @example st help
 * @returns A string of commands and descriptions.
 */
function getChildCommands(parentDirList, onlyParent, commandsString) {
    return new Promise(async function (resolve, reject) {
        let response = '';
        if (onlyParent) {
            response = '以下是 "/' + commandsString + '" 的指令幫助與說明：\n指令不分大小寫，但幫助文件中的大寫字母代表該指令的簡易指令，例：/st h 相等於 /st help';
            for (let key in parentDirList.data) {
                if (parentDirList.data[key].type == 'floder') {
                    // Description in help file is required!!
                    response += '\n' + parentDirList.data[key].name + ': ' + parentDirList.data[key].data.help.data.description + ' 使用 "/' + commandsString + ' ' + parentDirList.data[key].name + ' help" 來獲取指令幫助。';
                } else if (parentDirList.data[key].type == 'js') {
                    // Description in js file is required!!
                    response += '\n' + parentDirList.data[key].name + ': ' + parentDirList.data[key].data.description;
                }
            }
        } else {
            for (let key in parentDirList.data) {
                if (parentDirList.data[key].type == 'floder') {
                    // Description in help file is required!!
                    response += await getChildCommands(parentDirList.data[key], onlyParent, commandsString + ' ' + parentDirList.data[key].name);
                } else if (parentDirList.data[key].type == 'js') {
                    // Description in js file is required!!
                    response += '\n/' + commandsString + ' ' + parentDirList.data[key].name + ': ' + parentDirList.data[key].data.description;
                }
            }
        }
        resolve(response);
    });
}


module.exports = {
    /**
     * Get a full list of commands and require each file.
     * Notice:
     *   1. Please notice that a file name should not include dot(s) or space(s)!
     *   2. An extension name of a file should not be 'floder'.
     *   3. A filename includes uppercase letter(s) will be a simplify command of it.
     *   4. Each floder must have a Help.js file and a description module.export!
     * @returns {JSON} A JSON format commands list.
     */
    get: function () {
        return new Promise(async function (resolve, reject) {
            resolve(await getCommandsInfo().catch(err => reject(err)));
        });
    },
    /**
     * Get a list of child commands in a floder.
     * @param {Array<string>} msgs A full array of which user send.
     * @param {boolean} [onlyParent] If only want to get help of a floder without child floder.
     * @param {string} [targetCommands] A string of valid parent command.
     * @example ['st', 'help']
     * @returns {String} A string of commands description of the specific command.
     */
    getCommands: function (msgs, onlyParent = true, targetCommands) {
        return new Promise(async function (resolve, reject) {
            if (!msgs) reject('Parameter lost.');
            console.log('getCommands');
            targetCommands = targetCommands ? targetCommands : await filterCommands(msgs, await getCommandsInfo().catch(err => reject(err)), 0).catch(err => reject(err));
            let targetCommandsData = await getCommandsData(targetCommands, await getCommandsInfo().catch(err => reject(err)), 0).catch(err => reject(err));
            console.log(targetCommandsData, onlyParent, targetCommands);
            resolve(await getChildCommands(targetCommandsData, onlyParent, targetCommands).catch(err => reject(err)));
        });
    },
    /**
    * Check the command in msgs is currect or not.
    * @param {Array<string>} msgs An array of messages, should not have space(s) or dot(s).
    * @example ['mt', 'help']
    * @returns Data of required file.
    * @throws If command not found, throw a string of "404 Command Not Found: " and which command that is not found.
    */
    check: function (msgs) {
        return new Promise(async function (resolve, reject) {
            if (!msgs) reject('Parameter lost.');
            let targetCommands = await filterCommands(msgs, await getCommandsInfo().catch(err => reject(err)), 0, '').catch(err => reject(err));
            console.log(targetCommands);
            resolve(await getCommandsData(targetCommands, await getCommandsInfo().catch(err => reject(err)), 0).catch(err => reject(err)));
        });
    }
}