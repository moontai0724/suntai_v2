const path = require("path");

// Own functions
const fortuneStick = require(path.join(__dirname, "FortuneStick.json"));
// Source: https://gist.github.com/d94bb0a9f37cfd362453

module.exports = {
    description: '運勢抽籤相關功能。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            if (/^[0-9]{1,2}$/.test(event.message.text)) {
                resolve({
                    type: "template",
                    altText: `籤號：${fortuneStick[event.message.text].id}　${fortuneStick[event.message.text].type}！\n籤詩：${fortuneStick[event.message.text].poem}\n\n解籤請打 /ST Fortune Solve ${fortuneStick[rn].id}`,
                    template: {
                        "type": "buttons",
                        "title": `籤號：${fortuneStick[event.message.text].id}　${fortuneStick[event.message.text].type}！`,
                        "text": fortuneStick[event.message.text].poem,
                        "actions": [
                            {
                                "type": "message",
                                "label": "解籤",
                                "text": "/ST Fortune Solve " + fortuneStick[event.message.text].id
                            }
                        ]
                    }
                });
            } else reject("籤號錯誤");
        });
    }
};