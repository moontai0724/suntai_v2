const MsgFormat = require('../../functions/MsgFormat.js');
const CommandsList = require('../../functions/CommandsList.js');

module.exports = {
    description: '普通指令協助。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            resolve(MsgFormat.Text(await CommandsList.getCommands(event.message.originalText.replace('/', '').split(' '), !/^all$/i.test(event.message.text.replace(/\s/, '')), event.data.parents.toLowerCase())));
        });
    }
};