const MsgFormat = require('../functions/MsgFormat.js');

module.exports = {
    description: "Changelog.",
    MessageHandler: function (event) {
        return new Promise((resolve, reject) => {
            let msgs = event.message.text.split(' ');
            if (msgs[1] && msgs[1].toLowerCase() == 'lastest') {
                resolve(MsgFormat.Text(changelog.lastest + ': ' + changelog[changelog.lastest]));
            } else if (msgs[1] && msgs[1].toLowerCase() == 'all') {
                let response = '';
                for (let key in changelog) {
                    response += key + ': ' + changelog[key];
                }
                resolve(MsgFormat.Text(response));
            } else if (msgs[1] && changelog[msgs[1]]) {
                resolve(MsgFormat.Text(changelog[msgs[1]]));
            } else {
                reject(MsgFormat.Text('Error: 沒有這個版本號。'));
            }
        });
    }
};

const changelog = {
    "lastest": "1.0.0",
    "1.0.0": "基本功能與文件定義發布"
};