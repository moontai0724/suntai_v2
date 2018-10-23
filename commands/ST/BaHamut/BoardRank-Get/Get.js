const path = require("path");
const najax = $ = require('najax');

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));
const boardClasses = require(path.join(__dirname, 'List.js')).value;

module.exports = {
    description: '獲取巴哈姆特看板排名，指令參數：[排名數量]:10 [看板類別]:21(全)' +
        '\n[] 代表可填可不填，<> 代表必要函數，：後方代表預設參數。' +
        '\n排名數量上限 60。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            let messages = event.message.text.split(' ');
            messages[0] = (1 <= Number(messages[0]) && Number(messages[0]) <= 60) ? messages[0] : 10;
            if (messages[1] && Number(messages[1]) != NaN) {
                if (boardClasses.find(value => value.c == Number(messages[1]))) {
                    console.log(0, messages[1]);
                    resolve(MsgFormat.Text(await getRank(messages[0], messages[1], 1, [])));
                    return 0;
                } else {
                    for (let i = 0; i < boardClasses.length; i++) {
                        if (boardClasses[i].c == Number(messages)) {
                            console.log(1, messages[1]);
                            resolve(MsgFormat.Text(await getRank(messages[0], messages[1], 1, [])));
                            return 0;
                        }
                    }
                    reject('沒有這個看板類別。');
                }
            } else if (messages[1]) reject('沒有這個看板類別。');
            else resolve(MsgFormat.Text(await getRank(messages[0], 21, 1, [])));
        });
    }
};

function getRank(count, boardClass, page, previous) {
    return new Promise((resolve, reject) => {
        $({
            type: 'GET',
            url: 'https://forum.gamer.com.tw/ajax/rank.php?c=' + boardClass,
            dataType: 'json',
            async: true,
            success: function (data) {
                (async function () {
                    data = data.map(value => (Number(value.ranking) + ((page - 1) * 30)) + ". " + value.title + ": " + value.hot);
                    if (Math.ceil(count / 30) > page) resolve((await getRank(count, boardClass, page + 1, previous.concat(data))).filter((value, index) => index < count).join('\n'));
                    else if (page != 1) resolve(previous.concat(data));
                    else resolve(data.filter((value, index) => index < count).join('\n'));
                })();
            },
            error: data => (console.log(data), reject(data))
        });
    });
}