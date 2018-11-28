const path = require("path");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));
const fortuneStick = require(path.join(process.cwd(), "functions", "FortuneStick.json"));
// Source: https://gist.github.com/d94bb0a9f37cfd362453

module.exports = {
    description: '解指定的籤。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            if (isNaN(event.message.text) == false && 1 <= Number(event.message.text) && Number(event.message.text) <= 100 && /^([0-9]{1,2}|100)$/.test(event.message.text)) {
                let stickNumber = Number(event.message.text) - 1;
                let replyMsg = `籤號：${fortuneStick[stickNumber].id}　${fortuneStick[stickNumber].type}！\n解籤：${fortuneStick[stickNumber].explain}\n`;
                for (let key in fortuneStick[stickNumber].result) {
                    replyMsg += `\n${key}：${fortuneStick[stickNumber].result[key]}`;
                }
                resolve(MsgFormat.Text(replyMsg));
            } else reject("籤號錯誤");
        });
    }
};