// Own functions
const MsgFormat = require('../../../../functions/MsgFormat.js');
const boardClasses = [{
    "c": "21", "name": "全", "sub":
        [
        ]
}, {
    "c": "400", "name": "線上", "sub":
        [
            { "c": "401", "name": "角色扮演" },
            { "c": "402", "name": "動作" },
            { "c": "403", "name": "射擊" },
            { "c": "404", "name": "運動" },
            { "c": "405", "name": "競速" },
            { "c": "406", "name": "冒險" },
            { "c": "407", "name": "策略模擬" },
            { "c": "408", "name": "益智" },
            { "c": "409", "name": "其他" }
        ]
},
{
    "c": "94", "name": "手機", "sub":
        [
            { "c": "93", "name": "主機平台" },
            { "c": "81", "name": "角色扮演" },
            { "c": "82", "name": "動作" },
            { "c": "83", "name": "射擊" },
            { "c": "84", "name": "運動" },
            { "c": "85", "name": "競速" },
            { "c": "86", "name": "冒險" },
            { "c": "87", "name": "策略模擬" },
            { "c": "88", "name": "益智" },
            { "c": "89", "name": "線上角色扮演" },
            { "c": "90", "name": "線上休閒" },
            { "c": "91", "name": "其他" }
        ]
},
{
    "c": "80", "name": "網頁", "sub":
        [
            { "c": "71", "name": "角色扮演" },
            { "c": "72", "name": "動作" },
            { "c": "73", "name": "射擊" },
            { "c": "74", "name": "運動" },
            { "c": "75", "name": "競速" },
            { "c": "76", "name": "冒險" },
            { "c": "77", "name": "策略模擬" },
            { "c": "78", "name": "益智" },
            { "c": "79", "name": "其他" }
        ]
},
{
    "c": "40", "name": "電腦", "sub":
        [
            { "c": "31", "name": "角色扮演" },
            { "c": "32", "name": "動作" },
            { "c": "33", "name": "射擊" },
            { "c": "34", "name": "運動" },
            { "c": "35", "name": "競速" },
            { "c": "36", "name": "冒險" },
            { "c": "37", "name": "策略模擬" },
            { "c": "38", "name": "益智" },
            { "c": "39", "name": "其他" }
        ]
},
{
    "c": "52", "name": "TV 掌機", "sub":
        [
            { "c": "92", "name": "主機平台" },
            { "c": "41", "name": "角色扮演" },
            { "c": "42", "name": "動作" },
            { "c": "43", "name": "射擊" },
            { "c": "44", "name": "運動" },
            { "c": "45", "name": "競速" },
            { "c": "46", "name": "冒險" },
            { "c": "47", "name": "策略模擬" },
            { "c": "48", "name": "益智" },
            { "c": "49", "name": "線上角色扮演" },
            { "c": "50", "name": "線上休閒" },
            { "c": "51", "name": "其他" }
        ]
},
{
    "c": "22", "name": "動漫畫", "sub":
        [
        ]
},
{
    "c": "61", "name": "主題", "sub":
        [
            { "c": "62", "name": "作品綜合討論" },
            { "c": "63", "name": "主題交流研究" },
            { "c": "65", "name": "巴哈姆特相關" }
        ]
},
{
    "c": "95", "name": "場外", "sub":
        [
            { "c": "96", "name": "休閒娛樂" },
            { "c": "97", "name": "地區板" },
            { "c": "98", "name": "輕鬆聊" }
        ]
},
{
    "c": "28", "name": "站務", "sub":
        [
        ]
}];

module.exports = {
    description: '獲取看板類別，指令參數：[母類別編號]' +
        '\n[] 代表可填可不填，<> 代表必要函數，：後方代表預設參數，母類別編號留空即顯示母類別與編號。',
    value: boardClasses,
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            if (event.message.text != '' && Number(event.message.text) != NaN) {
                let target = boardClasses.find(value => value.c == Number(event.message.text));
                if (target) {
                    if (target.sub.length > 0) {
                        resolve(MsgFormat.Text("以下是 " + target.c + ". " + target.name + "的子類別：\n" + target.sub.map(value => value.name + ': ' + value.c).join('\n')));
                    } else reject('該看板類別沒有子看板。');
                } else reject('沒有這個看板類別。');
            } else resolve(MsgFormat.Text("以下是所有的母看板類別：\n" + boardClasses.map(value => value.name + ': ' + value.c).join('\n') + "\n輸入 /ST BaHamut BoardRank List [母類別編號] 以獲取更詳細的子看板類別。"));
        });
    }
};