// Own functions
const MsgFormat = require('../../../functions/MsgFormat.js');
const Chatlog = require('../../../functions/Chatlog.js');

module.exports = {
    description: '群組各類訊息發言次數排名查詢。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            if (/^(Help|h)$/i.test(event.message.text.replace(/\s/, ''))) {
                resolve(MsgFormat.Text('可用的參數：[訊息類型]:text [排名數量]:10' +
                    '\n[] 代表可填可不填，<> 代表必要函數，：後方代表預設參數。' +
                    '\n可用訊息類型如下：' +
                    '\n文字: text' +
                    '\n圖片： image' +
                    '\n影片: video' +
                    '\n音訊: audio' +
                    '\n檔案: file' +
                    '\n位置資訊: location' +
                    '\n貼圖: sticker' +
                    '\n範例： /st l r text 10'));
                return 0;
            }

            let messages = event.message.text.split(' '), messageType = ["text", "image", "video", "audio", "file", "location", "sticker"];
            let response = "以下是 " + (messageType.indexOf(messages[0]) > -1 ? messages[0] : 'text') + " 的訊息量排名：\n" + await Chatlog.showRank(event.source[event.source.type + 'Id'], (messageType.indexOf(messages[0]) > -1 ? messages[0] : 'text'), (Number(messages[1]) != NaN ? Number(messages[1]) : 10));
            resolve(MsgFormat.Text(response));
        });
    }
};