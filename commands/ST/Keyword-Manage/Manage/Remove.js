const path = require("path");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));
const DataBase = require(path.join(process.cwd(), "functions", "DataBase.js"));
const Authorize = require(path.join(process.cwd(), "functions", "Authorize.js"));

module.exports = {
    description: '刪除關鍵字回應，指令格式：<id>，只能刪除自己創建的關鍵字回應。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            if (/[0-9]*/.test(event.message.text)) {
                DataBase.readTable('Keyword', event.message.text).then(async function (keyword) {
                    if (keyword[0].author == event.source.userId || await Authorize.Owner(event.source.userId)) {
                        DataBase.deleteWithId('Keyword', event.message.text).then(() => {
                            resolve(MsgFormat.Text("已經刪除以下回應：\n{\n  id: " + keyword[0].id + ",\n  method: " + keyword[0].method + ",\n  keyword: " + decodeURIComponent(keyword[0].keyword) + ",\n  dataType: " + keyword[0].dataType + ",\n  data: " + decodeURIComponent(keyword[0].data) + "\n}"));
                        }, reject);
                    } else reject("您只能刪除自己創建的回應！");
                }, reject);
            } else reject('ID 必須為一個數字！');
        });
    }
};