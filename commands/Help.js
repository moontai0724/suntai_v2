const MsgFormat = require('../functions/MsgFormat.js')

module.exports = {
    description: '您好，我是日太！在和我互動前請先詳讀以下事項：' +
        '\n1. 由於 Developer Trial 帳號限制最大好友數為 50 人，因此請勿加入好友。' +
        '\n　 由於 Developer Trial 帳號限制最大好友數為 50 人，因此請勿加入好友！' +
        '\n　 由於 Developer Trial 帳號限制最大好友數為 50 人，因此請勿加入好友！！\n' +
        '\n2. 如需獲得任何指令協助，請輸入：/st help' +
        '\n3. 指令協助中，大寫字母代表簡易指令。' +
        '\n以上就是日太的操作說明與提醒事項囉！' +
        '\n\nDeveloper：月太 moontai0724' +
        '\nHomepage：https://home.gamer.com.tw/moontai0724' +
        '\nSource Code: https://github.com/moontai0724/suntaidev',
    MessageHandler: function (event) {
        return new Promise((resolve, reject) => {
            resolve(MsgFormat.Text(module.exports.description));
        });
    }
};
