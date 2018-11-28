const path = require("path");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));
const fortuneStick = require(path.join(__dirname, "FortuneStick.json"));
// Source: https://gist.github.com/d94bb0a9f37cfd362453

module.exports = {
    description: '解指定的籤。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            if (/^[0-9]{1,2}$/.test(event.message.text)) {
                let replyMsg = `籤號：${fortuneStick[rn].id}　${fortuneStick[rn].type}！\n解籤：${fortuneStick[StickNumber].explain}\n`;
                for (let key in fortuneStick[StickNumber].result) {
                    replyMsg += `\n${key}：${fortuneStick[StickNumber].result[key]}`;
                }
                resolve(replyMsg);
            } else reject("籤號錯誤");
        });
    }
};