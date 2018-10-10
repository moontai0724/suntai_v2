// Own functions
const MsgFormat = require('../../../functions/MsgFormat.js');
const DataBase = require('../../../functions/DataBase.js');

module.exports = {
    description: '禁止關鍵字，指令格式：<keyword(Regex)>',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            DataBase.readTable('KeywordBanList').then(banList => {
                DataBase.insertValue('KeywordBanList', [(banList.length == 0 ? banList.length : (Number(banList[banList.length - 1].id) + 1)), encodeURIComponent(event.message.text)]).then(() => {
                    resolve(MsgFormat.Text("已經設定好以下禁止關鍵字：\n{\n  id: " + banList.length + ",\n  data: " + event.message.text + "\n}"));
                }, reject);
            }, reject);
        });
    }
};