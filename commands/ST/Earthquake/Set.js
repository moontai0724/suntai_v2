const path = require("path");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));
const DataBase = require(path.join(process.cwd(), "functions", "DataBase.js"));
const AllCity = ['臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市', '基隆市', '新竹市', '嘉義市', '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '澎湖縣', '金門縣', '連江縣'];

module.exports = {
    description: '設定地震通知地區，如有多個縣市名稱請使用空格分隔多個縣市編號。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            let messages = event.message.text.split(' ');
            for (let i = 0; i < messages.length; i++) {
                if (Number(messages[i]) != NaN && 0 < Number(messages[i]) && Number(messages[i]) < 23) {
                    messages[i] = AllCity[Number(messages[i]) - 1];
                } else if (Number(messages[i]) != NaN && 0 == Number(messages[i]) || messages[i] == "全") {
                    messages = messages.concat(AllCity);
                }
            }
            messages = messages.filter(value => value != 0);

            DataBase.readTable('EarthquakeNotification').then(EarthquakeNotificationList => {
                if (EarthquakeNotificationList.find(element => { return element.id == event.source[event.source.type + 'Id']; })) {
                    let eqnAreaList = EarthquakeNotificationList.find(element => { return element.id == event.source[event.source.type + 'Id']; }).area.split(', ');
                    messages.forEach(value => {
                        if (eqnAreaList.includes(value)) eqnAreaList.splice(eqnAreaList.findIndex(element => { return element == value; }), 1);
                        else eqnAreaList[eqnAreaList.length] = value;
                    });
                    DataBase.updateValue('EarthquakeNotification', event.source[event.source.type + 'Id'], "", "Area", eqnAreaList.join(', '));
                    resolve(MsgFormat.Text('已經更新地震通知地區，目前通知地區：' + eqnAreaList.join('、')));
                } else {
                    let target = [];
                    messages.forEach(value => {
                        if (target.includes(value)) target.splice(target.findIndex(element => { return element == value; }), 1);
                        else target[target.length] = value;
                    });
                    DataBase.insertValue('EarthquakeNotification', [event.source[event.source.type + 'Id'], target.join(', ')]);
                    resolve(MsgFormat.Text('已經更新地震通知地區，目前通知地區：' + target.join('、')));
                }
            });
        });
    }
};