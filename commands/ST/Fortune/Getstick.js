const path = require("path");

// Own functions
const fortuneStick = require(path.join(process.cwd(), "functions", "FortuneStick.json"));
// Source: https://gist.github.com/d94bb0a9f37cfd362453

module.exports = {
    description: '運勢抽籤相關功能。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            if (isNaN(event.message.text) == false && 1 <= Number(event.message.text) && Number(event.message.text) <= 100 && /^([0-9]{1,2}|100)$/.test(event.message.text)) {
                let stickNumber = Number(event.message.text) - 1;
                resolve({
                    type: "template",
                    altText: `籤號：${fortuneStick[stickNumber].id}　${fortuneStick[stickNumber].type}！\n籤詩：${fortuneStick[stickNumber].poem}\n\n解籤請打 /ST Fortune Solve ${fortuneStick[rn].id}`,
                    template: {
                        "type": "buttons",
                        "title": `籤號：${fortuneStick[stickNumber].id}　${fortuneStick[stickNumber].type}！`,
                        "text": fortuneStick[stickNumber].poem,
                        "actions": [
                            {
                                "type": "message",
                                "label": "解籤",
                                "text": "/ST Fortune Solve " + fortuneStick[stickNumber].id
                            }
                        ]
                    }
                });
            } else reject("籤號錯誤");
        });
    }
};