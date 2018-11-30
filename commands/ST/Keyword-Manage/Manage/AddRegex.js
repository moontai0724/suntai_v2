const path = require("path");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));
const DataBase = require(path.join(process.cwd(), "functions", "DataBase.js"));
const safeRegex = require("safe-regex");

module.exports = {
    description: "新增關鍵字回應，指令格式：<keyword> -response <response>，若非正則符號請跳脫。\n請注意：預設只會在新增的地方回應。",
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            var keyword = event.message.text.match(/([\s\S]*?) -response ([\s\S]*)/i);
            if (keyword.length != 3) reject("輸入錯誤！指令格式：<keyword> -response <response>，例如：1 2 3 -response 4-5-6");

            // 禁止回應某些關鍵字
            DataBase.readTable("KeywordBanList").then(banList => {
                banList.forEach((value, index) => {
                    if ((new RegExp(decodeURIComponent(value.data))).test(keyword[3])) {
                        reject("您的關鍵字回應中含有被禁止的關鍵字。");
                        return 0;
                    } else if (banList.length - 1 == index) {
                        try {
                            new RegExp(keyword[1]);
                        } catch (error) {
                            reject("您新增的正則表達式錯誤！若非正則符號請跳脫！");
                        }

                        if (safeRegex(keyword[1])) {
                            DataBase.readTable("Keyword").then(keywordList => {
                                if (keywordList.findIndex(element => element.keyword == encodeURIComponent(keyword[1])) == -1) {
                                    DataBase.insertValue("Keyword", [(keywordList.length == 0 ? keywordList.length : (Number(keywordList[keywordList.length - 1].id) + 1)), event.source.userId, event.source[event.source.type + "Id"], "", encodeURIComponent(keyword[1]), "Regexp", encodeURIComponent(keyword[2])]).then(() => {
                                        resolve(MsgFormat.Text("已經設定好以下回應：\n{\n  id: " + keywordList.length + ",\n  keyword: " + keyword[1] + ",\n  dataType: Regexp,\n  data: " + keyword[3] + "\n}"));
                                    }, reject);
                                }
                            }, reject);
                        } else reject("您新增的正則表達式錯誤！若非正則符號請跳脫！");
                    }
                });
            });
        });
    }
};