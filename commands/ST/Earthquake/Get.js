// Own functions
const MsgFormat = require('../../../functions/MsgFormat.js');
const DataBase = require('../../../functions/DataBase.js');

module.exports = {
    description: '獲取已設定的地震通知地區。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            DataBase.readTable('EarthquakeNotification').then(EarthquakeNotificationList => {
                if (EarthquakeNotificationList.find(element => { return element.id == event.source[event.source.type + 'Id']; })) {
                    let eqnAreaList = EarthquakeNotificationList.find(element => { return element.id == event.source[event.source.type + 'Id']; }).area;
                    resolve(MsgFormat.Text('啟用地區如下： ' + eqnAreaList.replace(/, /g, '、')), MsgFormat.Text('如需調整通知地區，請使用指令：/ST Earthquake SET <地區編號>，使用 /ST Earthquake LIST 獲取地區編號列表。選擇的地區若沒有選擇過將會新增，若已經有選擇過將會移除。'));
                } else resolve(MsgFormat.Text('並沒有啟用地震通知。'));
            });
        });
    }
};