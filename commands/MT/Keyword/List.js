const path = require("path");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));
const DataBase = require(path.join(process.cwd(), "functions", "DataBase.js"));
const Pastebin = require(path.join(process.cwd(), "functions", "Pastebin.js"));

module.exports = {
    description: '列出目前有的禁止關鍵字。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            DataBase.readTable('KeywordBanList').then(keyword => {
                Pastebin.post(keyword.map(value => "{\n\tid: " + value.id + ",\n\tdata: " + value.data + "\n}").join('\n'), false, 1, "10M", "SunTai Keyword Response Ban List (" + (new Date()).toLocaleString("zh-tw", { hour12: false }) + ")").then(url => resolve(MsgFormat.Text('關鍵字禁止清單如下：' + url)), reject)
            }, reject);
        });
    }
};