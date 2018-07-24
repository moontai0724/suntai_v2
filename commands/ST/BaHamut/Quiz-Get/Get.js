// Own functions
const MsgFormat = require('../../../../functions/MsgFormat.js');
const najax = $ = require('najax');

module.exports = {
    description: '獲取隨機巴哈姆特動漫電玩通題目，指令參數：[看板編號]' +
        '\n[] 代表可填可不填，<> 代表必要函數，：後方代表預設參數。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            $.get('https://script.google.com/macros/s/AKfycbxYKwsjq6jB2Oo0xwz4bmkd3-5hdguopA6VJ5KD/exec?action=getRandomQuiz' + (Number(event.message.text) != NaN && event.message.text != '' ? '&bsn=' + Number(event.message.text) : ''), {
                error: data => $.get(data.responseText.match(/<A HREF="[\s\S]*">/)[0].replace('<A HREF="', '').replace('">', '').replace(/&amp;/g, '&'), {
                    success: data => {
                        data = JSON.parse(data);
                        $.get('https://forum.gamer.com.tw/A.php?bsn=' + data.BoardSN).then(boardName => {
                            boardName = boardName.match(/<title>[\s\S]*<\/title>/)[0].replace(/<title>|<\/title>/g, '');
                            resolve([MsgFormat.Text(data.quiz_question +
                                '\n\n1. ' + data.quiz_option_1 +
                                '\n2. ' + data.quiz_option_2 +
                                '\n3. ' + data.quiz_option_3 +
                                '\n4. ' + data.quiz_option_4), {
                                "type": "template",
                                "altText": '題目編號：' + data.quiz_sn + '\n題目來源哈啦區：' + boardName + '\n電腦版獲取答案請輸入 /ST BaHamut Quiz Ans ' + data.quiz_sn,
                                "template": {
                                    "type": "buttons",
                                    "actions": [
                                        {
                                            "type": "message",
                                            "label": "獲取答案",
                                            "text": "/ST BaHamut Quiz Ans " + data.quiz_sn
                                        }
                                    ],
                                    "text": '題目編號：' + data.quiz_sn + '\n題目來源哈啦區：' + boardName
                                }
                            }]);
                        });
                    }
                })
            });
        });
    }
};
