// Own functions
const MsgFormat = require('../../../functions/MsgFormat.js');
const DataBase = require('../../../functions/DataBase.js');
const Authorize = require('../../../functions/Authorize.js');

module.exports = {
    description: '刪除關鍵字回應，指令格式：<id>，只能刪除自己創建的關鍵字回應。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            if (/[0-9]*/.test(event.message.text)) {
                DataBase.readTable('Keyword', event.message.text).then(async function (keyword) {
                    if (keyword.author == event.source.userId || await Authorize.Owner(event.source.userId)) {
                        DataBase.deleteWithId('Keyword', event.message.text).then(() => {
                            resolve(MsgFormat.Text("已經刪除以下回應：\n{\n  id: " + keyword.id + ",\n  method: " + keyword.method + ",\n  keyword: " + keyword.keyword + ",\n  dataType: " + keyword.dataType + ",\n  data: " + keyword.data + "\n}"));
                        }, reject);
                    } else reject("您只能刪除自己創建的回應！");
                }, reject);
            } else reject('ID 必須為一個數字！');
        });
    }
};