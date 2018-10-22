const path = require("path");
const najax = $ = require('najax');

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));

module.exports = {
    description: '獲取巴哈姆特動漫電玩通題目之答案，指令參數：<題目編號>' +
        '\n[] 代表可填可不填，<> 代表必要函數，：後方代表預設參數。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            if (Number(event.message.text) != NaN) {
                $.get('https://script.google.com/macros/s/AKfycbxYKwsjq6jB2Oo0xwz4bmkd3-5hdguopA6VJ5KD/exec?action=getAns&sn=' + Number(event.message.text), {
                    error: data => $.get(data.responseText.match(/<A HREF="[\s\S]*">/)[0].replace('<A HREF="', '').replace('">', '').replace(/&amp;/g, '&'), {
                        success: data => {
                            if (/^1|2|3|4$/.test(data)) resolve(MsgFormat.Text('本題答案是：' + data));
                            else reject('題庫中沒有這一題＞＜');
                        }
                    })
                });
            } else reject('請輸入正確的題目編號。');
        });
    }
};