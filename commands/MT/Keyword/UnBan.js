// Own functions
const MsgFormat = require('../../../functions/MsgFormat.js');
const DataBase = require('../../../functions/DataBase.js');

module.exports = {
    description: '取消禁止關鍵字，指令格式：<ID>',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            if (/[0-9]*/.test(event.message.text)) {
                DataBase.readTable('KeywordBanList', event.message.text).then(async function (keyword) {
                    DataBase.deleteWithId('KeywordBanList', event.message.text).then(() => {
                        resolve(MsgFormat.Text("已經刪除以下回應：\n{\n  id: " + keywordList[0].id + ",\n  data: " + keywordList[0].data + "\n}"));
                    }, reject);
                }, reject);
            } else reject('ID 必須為一個數字！');
        });
    }
};