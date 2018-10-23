const path = require("path");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));
const DataBase = require(path.join(process.cwd(), "functions", "DataBase.js"));
const Pastebin = require(path.join(process.cwd(), "functions", "Pastebin.js"));
const Authorize = require(path.join(process.cwd(), "functions", "Authorize.js"));

module.exports = {
    description: '列出目前有的關鍵字回應，參數：-My 顯示自己的回應清單、-Here 顯示此群組內創建的清單、-Public 顯示公共回應清單，-All 顯示全部。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            var param = [], all = false;
            if (/-M(y)?/i.test(event.message.text)) param[param.length] = 'author="' + event.source.userId + '"';
            if (/-H(ere)?/i.test(event.message.text)) param[param.length] = 'place="' + event.source[event.source.type + 'Id'] + '"';
            if (/-P(ublic)?/i.test(event.message.text)) param[param.length] = 'place="Public"';
            if (/-A(ll)?/i.test(event.message.text)) {
                if (await Authorize.Owner(event.source.userId)) all = true;
                else {
                    reject('您沒有權限讀取全部關鍵字回應！');
                    return 0;
                }
            }

            if (param.length == 0 && !all) reject('缺少參數，參數：-My 顯示自己的回應清單、-Here 顯示此群組內創建的清單、-Public 顯示公共回應清單，-All 顯示全部。');

            DataBase.all('SELECT * FROM Keyword' + (!all ? ' WHERE ' + param.join(' AND ') : '')).then(keyword => {
                Pastebin.post(keyword.map(value => '{\n\t"id": "' + value.id + '",\n\t"author": "' + value.author + '",\n\t"place": "' + value.place + '",\n\t"method": "' + value.method + '",\n\t"keyword": "' + decodeURIComponent(value.keyword) + '",\n\t"dataType": "' + value.dataType + '",\n\t"data": "' + decodeURIComponent(value.data) + '"\n}').join('\n'), false, 1, '10M', 'SunTai Keyword Response List (' + (new Date()).toLocaleString('zh-tw', { hour12: false }) + ')', 'json').then(url => resolve(MsgFormat.Text('關鍵字回應詳細清單如下：' + url)), reject)
            }, reject);
        });
    }
};