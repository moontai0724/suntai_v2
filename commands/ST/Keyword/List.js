// Own functions
const MsgFormat = require('../../../functions/MsgFormat.js');
const DataBase = require('../../../functions/DataBase.js');
const Pastebin = require('../../../functions/Pastebin.js');

module.exports = {
    description: '列出目前有的關鍵字回應。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            DataBase.readTable('keyword').then(keyword => Pastebin.post(keyword.map(value => "{\n\tid: " + value.id + ",\n\tmethod: " + value.method + ",\n\tkeyword: " + decodeURIComponent(value.keyword) + ",\n\tdataType: " + value.dataType + ",\n\tdata: " + decodeURIComponent(value.data) + "\n}"), false, 1, "10M", "SunTai Keyword Response List (" + (new Date()).toLocaleString("zh-tw", { hour12: false }) + ")").then(url => resolve(MsgFormat.Text('關鍵字回應詳細清單如下：' + url)), reject), reject);
        });
    }
};