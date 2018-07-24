// Own functions
const MsgFormat = require('../../../functions/MsgFormat.js');
const DataBase = require('../../../functions/DataBase.js');

module.exports = {
    description: '關閉地震通知。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            DataBase.readTable('EarthquakeNotification').then(EarthquakeNotificationList => {
                if (EarthquakeNotificationList.find(element => { return element.id == event.source[event.source.type + 'Id']; })) {
                    DataBase.deleteWithId('EarthquakeNotification', event.source[event.source.type + 'Id']).then(() => {
                        console.log(event.source[event.source.type + 'Id'] + ' 的地震通知已經關閉。');
                        resolve(MsgFormat.Text('地震通知已經關閉。'));
                    });
                } else resolve(MsgFormat.Text('並沒有啟用地震通知。'));
            });
        });
    }
};