const path = require("path");

// Own functions
const fortuneStick = require(path.join(__dirname, "FortuneStick.json"));
// Source: https://gist.github.com/d94bb0a9f37cfd362453

module.exports = {
    description: "隨機回應一個淺草一百籤的籤詩。",
    regex: /籤運/,
    response: function (event) {
        return new Promise((resolve, reject) => {
            resolve({
                type: "template",
                altText: `籤號：${fortuneStick[rn].id}　${fortuneStick[rn].type}！\n籤詩：${fortuneStick[rn].poem}\n\n解籤請打 /ST Fortune Solve ${fortuneStick[rn].id}`,
                template: {
                    "type": "buttons",
                    "title": `籤號：${fortuneStick[rn].id}　${fortuneStick[rn].type}！`,
                    "text": fortuneStick[rn].poem,
                    "actions": [
                        {
                            "type": "message",
                            "label": "解籤",
                            "text": "/ST Fortune Solve " + fortuneStick[rn].id
                        }
                    ]
                }
            });
        });
    }
};