const path = require("path");

// Require Line Bot SDK
const LineBotSDK = require('@line/bot-sdk');

// Require config
const Config = require(path.join(process.cwd(), "config", "config.json"));
const LineBotClient = new LineBotSDK.Client(Config.LineBot);

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));
const Authorize = require(path.join(process.cwd(), "functions", "Authorize.js"));
const Chatlog = require(path.join(process.cwd(), "functions", "Chatlog.js"));

module.exports = {
    description: '調閱紀錄功能。',
    MessageHandler: function (event) {
        return new Promise(async function (resolve, reject) {
            if (/^(Help|h)$/i.test(event.message.text.replace(/\s/, ''))) {
                resolve(MsgFormat.Text('可用的參數如下：' +
                    '\n-StartTime：指定查詢開始的完整時間' +
                    '\n-StartYear/Month/Date/Hour/Minute/Second：指定查詢開始的年、月、日、時、分、秒。' +
                    '\n\n-OverTime：指定查詢結束的完整時間' +
                    '\n-OverYear/Month/Date/Hour/Minute/Second：指定查詢結束的年、月、日、時、分、秒。' +
                    '\n\n-FullTime：指定查詢一段完整時間前的紀錄' +
                    '\n-Year/Month/Date/Hour/Minute/Second：指定查詢一段年、月、日、時、分、秒前的紀錄。' +
                    '\n\n　→完整時間格式：YYYY-MM-DD-HH-MM-SS' +
                    '\n　→預設開始時間 2018/1/1 00:00:00；結束時間 2018/1/1 00:00:00；一段時間：0/0/0 0:0:0' +
                    '\n　→指定一段時間的查詢不能與開始結束時間一起使用，如果都有填入將以 開始／結束 為主。' +
                    '\n　→範例１查詢五小時內的 10 條紀錄：/st l 10 -Hour 5' +
                    '\n　→範例２查詢 2017/1/1 00:00:00 ~ 2018/1/1 00:00:00 的 10 條紀錄：/st l 10 -StartYear 2017 -OverYear 2018' +
                    '\n　→範例３查詢 2018/01/20 15:39 ~ 2019/01/01 20:40 的 10 條紀錄：/st l 10 -StartYear 2018 -StartMonth 01 -StartDate 20 -StartHour 15 -StartMinute 39 -OverYear 2019 -OverHour 20 -OverMinute 40' +
                    '\n　→範例４查詢 2018/01/20 15:39 ~ 2019/01/01 20:40 的 10 條紀錄：/st l 10 -StartTime 2018-01-20-15-39-00 -OverTime 2019-01-01-20-40-00'));
                return 0;
            }

            var SourceData = {
                userId: event.source.userId ? event.source.userId : 'UNKNOWN',
                id: event.source[event.source.type + 'Id'],
                Profile: {
                    displayName: undefined,
                    userId: undefined,
                    pictureUrl: undefined,
                    statusMessage: undefined
                }
            };

            if (event.source.userId) {
                switch (event.source.type) {
                    case 'user':
                        SourceData.Profile = await LineBotClient.getProfile(event.source.userId); // displayName, userId, pictureUrl, statusMessage
                        break;
                    case 'group':
                        SourceData.Profile = await LineBotClient.getGroupMemberProfile(event.source.groupId, event.source.userId); // displayName, userId, pictureUrl
                        break;
                    case 'room':
                        SourceData.Profile = await LineBotClient.getRoomMemberProfile(event.source.roomId, event.source.userId); // displayName, userId, pictureUrl
                        break;
                }
            }

            let messages = event.message.text.split(' ');
            let settings = {
                'StartYear': 2018, 'StartMonth': 1, 'StartDate': 1, 'StartHour': 0, 'StartMinute': 0, 'StartSecond': 0,
                'OverYear': 2018, 'OverMonth': 1, 'OverDate': 1, 'OverHour': 0, 'OverMinute': 0, 'OverSecond': 0,
                'Year': 0, 'Month': 0, 'Date': 0, 'Hour': 0, 'Minute': 0, 'Second': 0
            };
            let changelog = { 'start': false, 'over': false, 'specific': false };

            console.log(event.message.text, messages);

            if (messages[0]) {
                for (let i = 1; i < messages.length; i = i + 2) {
                    if (messages[i] && messages[i + 1]) {
                        if (messages[i].includes('Start')) changelog.start = true;
                        else if (messages[i].includes('Over')) changelog.over = true;
                        else changelog.specific = true;

                        if (settings[messages[i].replace('-', '')] && !messages[i].includes('Time')) {
                            settings[messages[i].replace('-', '')] = Number(messages[i + 1]);
                        } else if (messages[i] == '-StartTime' || messages[i] == '-OverTime') {
                            let FullTime = messages[i + 1].split('-');
                            if (FullTime.length == 6) {
                                let firstword = messages[i].replace('-', '').replace('Time', '');
                                let lastword = ['Year', 'Month', 'Date', 'Hour', 'Minute', 'Second'];
                                for (let x = 0; x < FullTime.length; x++) {
                                    settings[firstword + lastword[x]] = Number(FullTime[x]);
                                }
                                console.log(settings);
                            } else {
                                reject('所賦予的時間參數有錯誤，須給 YYYY-MM-DD-HH-MM-SS。如需指令協助請打 /ST Log Help（大寫字母為簡易指令）。');
                                return 0;
                            }
                        } else if (messages[i].includes('-id') && await Authorize.Owner(SourceData.userId) == true) {
                            SourceData.id = messages[i + 1];
                        } else {
                            reject('所賦予的參數有錯誤，請檢查是否有拼字錯誤，或是少空格。如需指令協助請打 /ST Log Help（大寫字母為簡易指令）。');
                            return 0;
                        }
                    } else {
                        reject('所賦予的參數有缺少，請檢查是否少空格。如需指令協助請打 /ST Log Help（大寫字母為簡易指令）。');
                        return 0;
                    }
                }
                Chatlog.searchHistory(SourceData, Number(messages[0]), settings, changelog).then(data => resolve(MsgFormat.Text(data)));
            } else Chatlog.searchHistory(SourceData, 5, settings, changelog).then(data => resolve(MsgFormat.Text(data)));
        });
    }
};