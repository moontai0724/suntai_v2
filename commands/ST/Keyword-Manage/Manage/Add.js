const path = require("path");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));
const DataBase = require(path.join(process.cwd(), "functions", "DataBase.js"));

module.exports = {
    description: "新增關鍵字回應，指令格式：<keyword> -method <FullCompare(完全符合)|PartCompare(部分符合))> -response <response>，如要使用正則請使用 AddRegex 功能。\n請注意：預設只會在新增的地方回應。",
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            var keyword = event.message.text.match(/([\s\S]*?) -method (FullCompare|PartCompare|FC|PC) -response ([\s\S]*)/i), flag = true;
            if (keyword.length != 4 || keyword == null) reject("輸入錯誤！指令格式：<keyword> -method <FullCompare(完全符合)|PartCompare(部分符合))> -response <response>，例如：1 2 3 -method FullCompare -response 4-5-6");

            // 禁止回應某些關鍵字
            DataBase.readTable("KeywordBanList").then(banList => {
                banList.forEach((value, index) => {
                    if ((new RegExp(decodeURIComponent(value.data))).test(keyword[3])) {
                        flag = false;
                        reject("您的關鍵字回應中含有被禁止的關鍵字。");
                        return 0;
                    } else if (banList.length - 1 == index && flag) {
                        DataBase.readTable("Keyword").then(keywordList => {
                            if (keywordList.findIndex(element => element.keyword == encodeURIComponent(keyword[1])) == -1) {
                                DataBase.insertValue("Keyword", [(keywordList.length == 0 ? keywordList.length : (Number(keywordList[keywordList.length - 1].id) + 1)), event.source.userId, event.source[event.source.type + "Id"], keyword[2], encodeURIComponent(keyword[1]), "text", encodeURIComponent(keyword[3])]).then(() => {
                                    resolve(MsgFormat.Text("已經設定好以下回應：\n{\n  id: " + keywordList.length + ",\n  method: " + keyword[2] + ",\n  keyword: " + keyword[1] + ",\n  dataType: text,\n  data: " + keyword[3] + "\n}"));
                                }, reject);
                            }
                        }, reject);
                    }
                });
            });
        });
    }
};