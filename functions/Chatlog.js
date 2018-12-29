const path = require("path");

// Require Line Bot SDK
const LineBotSDK = require('@line/bot-sdk');

// Require config
const Config = require(path.join(process.cwd(), "config", "config.json"));
const LineBotClient = new LineBotSDK.Client(Config.LineBot);

// nodejs built-in package
const fs = require("fs");

// packages
const sqlite = require("sqlite");

// Own functions
const UTC8Time = require(path.join(__dirname, "UTC8Time.js")); //ok.include: getNowTime(function), value
const DataBase = require(path.join(__dirname, "DataBase.js"));

// Create if no such dir
if (!fs.existsSync(path.join(process.cwd(), "ChatlogFiles"))) fs.mkdir(path.join(process.cwd(), "ChatlogFiles"), () => console.log("Spawned ChatlogFiles dir."));
if (!fs.existsSync(path.join(process.cwd(), "database"))) fs.mkdir(path.join(process.cwd(), "database"), () => console.log("Spawned database dir."));

var Chatlog;
setTimeout(async function () {
    Chatlog = await sqlite.open(path.join(process.cwd(), "database", "Chatlog.sqlite"), { Promise });
});

module.exports = {
    /**
     * Log all message.
     * @param {JSON} event Original message event of line.
     */
    log: async function (event) {
        var SourceData = {
            userId: 'UNKNOWN',
            id: event.source[event.source.type + "Id"],
            Profile: {
                displayName: undefined,
                userId: undefined,
                pictureUrl: undefined,
                statusMessage: undefined
            }
        };

        if (event.source.userId) {
            SourceData.userId = event.source.userId;
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

            // userId log (not friend)
            DataBase.readTable("userIds").then(result => {
                if (result.findIndex(value => value.id == SourceData.userId) == -1)
                    DataBase.insertValue("userIds", [SourceData.userId, ""]);
            });
        }

        // groupId, roomId, userId log
        DataBase.readTable(event.source.type).then(result => {
            if (result.findIndex(value => value.id == SourceData.id) == -1)
                DataBase.insertValue(event.source.type, [SourceData.id, ""]);
        });

        var SaveData;
        switch (event.message.type) {
            case 'text':
                SaveData = event.message.originalText ? event.message.originalText : event.message.text;
                break;
            case 'image':
                SaveData = '[圖片] id: ' + event.message.id;
                SaveFile();
                break;
            case 'video':
                SaveData = '[影片] id: ' + event.message.id;
                SaveFile();
                break;
            case 'audio':
                SaveData = '[音訊] id: ' + event.message.id;
                SaveFile('m4a');
                break;
            case 'file':
                SaveData = '[檔案] FileName: ' + event.message.fileName + ', id: ' + event.message.id;
                SaveFile();
                break;
            case 'location':
                SaveData = '[位置]' +
                    ' title: ' + event.message.title +
                    ', Address: ' + event.message.address +
                    ', latitude: ' + event.message.latitude +
                    ', longitude: ' + event.message.longitude;
                break;
            case 'sticker':
                SaveData = '[貼圖]' +
                    ' packageId: ' + event.message.packageId +
                    ', stickerId: ' + event.message.stickerId;
                break;
        }

        function SaveFile(extension) {
            LineBotClient.getMessageContent(event.message.id).then(res => {
                if (!extension) { extension = res.headers['content-type'].split('/')[1] }
                var file = fs.createWriteStream(path.join(process.cwd(), "ChatlogFiles", event.timestamp + '.' + extension));
                res.on('data', chunk => file.write(chunk));
                res.on('end', () => {
                    file.end();
                    console.log(event.message.id + ', ' + event.timestamp + '.' + extension + ' Saved.');
                });
            });
        }

        (function restart(time) {
            setTimeout(function () {
                if (Chatlog) {
                    Chatlog.all('SELECT * FROM sqlite_master').then(data => {
                        if (data.findIndex(element => { return element.name == SourceData.id; }) > -1) {
                            console.log('INSERT INTO ' + SourceData.id + ' VALUES ("' + SourceData.userId + '", "' + SourceData.Profile.displayName + '", "' + event.message.type + '", ' + event.timestamp + ', "' + SaveData + '")');
                            Chatlog.run('INSERT INTO ' + SourceData.id + ' VALUES ("' + SourceData.userId + '", "' + encodeURIComponent(SourceData.Profile.displayName) + '", "' + event.message.type + '", ' + event.timestamp + ', "' + encodeURIComponent(SaveData) + '")').catch(err => reject(err));
                        } else {
                            console.log('CREATE TABLE ' + SourceData.id + ' (userId TEXT, displayName TEXT, messageType TEXT, timestamp INTEGER, message TEXT)');
                            Chatlog.run('CREATE TABLE ' + SourceData.id + ' (userId TEXT, displayName TEXT, messageType TEXT, timestamp INTEGER, message TEXT)').then(() => {
                                Chatlog.run('PRAGMA auto_vacuum = FULL;').catch(err => reject(err));
                                console.log('INSERT INTO ' + SourceData.id + ' VALUES ("' + SourceData.userId + '", "' + SourceData.Profile.displayName + '", "' + event.message.type + '", ' + event.timestamp + ', "' + SaveData + '")');
                                Chatlog.run('INSERT INTO ' + SourceData.id + ' VALUES ("' + SourceData.userId + '", "' + encodeURIComponent(SourceData.Profile.displayName) + '", "' + event.message.type + '", ' + event.timestamp + ', "' + encodeURIComponent(SaveData) + '")').catch(err => reject(err));
                            }, err => reject(err));
                        }
                    }, err => reject(err));
                } else restart(1000);
            }, time);
        })(0);
    },
    deleteOutdatedFiles: function (specificTimestamp) {
        if (!specificTimestamp) specificTimestamp = UTC8Time.getTimestamp() - 604800000 - 604800000 - 604800000 - 604800000;
        fs.readdir(path.join(process.cwd(), "ChatlogFiles"), (err, files) => {
            for (let i = 0; i < files.length; i++) {
                if (Number(files[i].split('.')[0]) < specificTimestamp) fs.unlink(path.join(process.cwd(), "ChatlogFiles", files[i]));
            }
        });
    },
    /**
     * @param {JSON} SourceData A JSON format of infomations.
     * @example {
     *      userId: "U68ee43b0****************412cb267",
     *      id: "C0170a911****************bdffceae",
     *      Profile: {
     *          displayName: "我是月太 づ(・ω・)づ #王ㄕㄥㄏㄨㄥ",
     *          userId: "U68ee43b0****************412cb267",
     *         pictureUrl: "http://dl.profile.line-cdn.net/0huSl-4w3JKnxRVAcxAEBVK2************************************kobWovZTplTnJQdBwo",
     *          statusMessage: "加好友的話說一下是誰和從哪來的～"
     *      }
     *  }
     * @param {Number} count A number of search count.
     * @param {JSON} settings A parameter include infomations about time range to search.
     * @example {
     *      'StartYear': 2018, 'StartMonth': 1, 'StartDate': 1, 'StartHour': 0, 'StartMinute': 0, 'StartSecond': 0,
     *      'OverYear': 2018, 'OverMonth': 1, 'OverDate': 1, 'OverHour': 0, 'OverMinute': 0, 'OverSecond': 0,
     *      'Year': 0, 'Month': 0, 'Date': 0, 'Hour': 0, 'Minute': 0, 'Second': 0
     *  }
     * @param {JSON} changelog A parameter to tell function what kind of infomation is provided.
     * @example { 'start': false, 'over': false, 'specific': false }
     */
    searchHistory: function (SourceData, count, settings, changelog) {
        return new Promise(function (resolve, reject) {
            if (count > 50) count = 50; else if (count < 1) count = 1;
            let searchParameter = '', fulltime = false, reverse = true;
            if (changelog.start == true || changelog.over == true) {
                let startTime = UTC8Time.getTimestamp(settings.StartYear + '-' + settings.StartMonth + '-' + settings.StartDate + ' ' + settings.StartHour + ':' + settings.StartMinute + ':' + settings.StartSecond);
                let overTime = UTC8Time.getTimestamp(settings.OverYear + '-' + settings.StartMonth + '-' + settings.OverDate + ' ' + settings.OverHour + ':' + settings.OverMinute + ':' + settings.OverSecond);
                fulltime = true;
                reverse = false;
                searchParameter = 'SELECT * FROM ' + SourceData.id + ' WHERE timestamp BETWEEN ' + startTime + ' AND ' + overTime + ' ORDER BY timestamp ASC LIMIT ' + count;
            } else if (changelog.specific == true) {
                let overTime = UTC8Time.getTimestamp();
                let SpecificTime = settings.Year * 1000 * 60 * 60 * 24 * 265 + settings.Month * 1000 * 60 * 60 * 24 * 30 + settings.Day * 1000 * 60 * 60 * 24 + settings.Hour * 1000 * 60 * 60 + settings.Minute * 1000 * 60 + settings.Second * 1000;
                reverse = false;
                searchParameter = 'SELECT * FROM ' + SourceData.id + ' WHERE timestamp BETWEEN ' + (overTime - SpecificTime) + ' AND ' + overTime + ' ORDER BY timestamp ASC LIMIT ' + count;
            } else {
                searchParameter = 'SELECT * FROM ' + SourceData.id + ' ORDER BY timestamp DESC LIMIT ' + count;
            }

            (function restart(time) {
                setTimeout(function () {
                    if (Chatlog) {
                        console.log(searchParameter);
                        Chatlog.all(searchParameter).then(data => {
                            let replyMsg = '沒有任何紀錄。';
                            if (data.length != 0) {
                                let option = { hour12: false, hour: 'numeric', minute: 'numeric' };
                                if (fulltime) {
                                    option.year = 'numeric';
                                    option.month = 'numeric';
                                    option.day = 'numeric';
                                }
                                if (reverse) data = data.reverse();
                                replyMsg = data.map(value => (new Date(value.timestamp)).toLocaleString('zh-tw', option) + ' ' + decodeURIComponent(value.displayName) + '-> ' + decodeURIComponent(value.message)).join('\n');
                            }
                            resolve(replyMsg);
                        }, err => reject(err));
                    } else restart(1000);
                }, time);
            })(0);
        })
    },
    /**
     * To get a list of rank of message count.
     * @param {string} id An id of room/user/group id to search.
     * @param {string} messageType Type of message to search.
     * @param {Number} rankCount Number of rank count to get.
     */
    showRank: function (id, messageType, rankCount) {
        return new Promise(async function (resolve, reject) {
            rankCount = (0 < rankCount && rankCount < 100) ? rankCount : 10;
            (function restart(time) {
                setTimeout(function () {
                    if (Chatlog) {
                        Chatlog.all('SELECT * FROM ' + id).then(data => {
                            let result = [];
                            data.forEach((value, index) => {
                                let exist = result.findIndex(element => { return element.userId == value.userId });
                                exist = exist > -1 ? exist : result.length;
                                result[exist] = result[exist] ? result[exist] : {
                                    "userId": "UNKNOWN",
                                    "displayName": undefined,
                                    "text": 0,
                                    "image": 0,
                                    "video": 0,
                                    "audio": 0,
                                    "file": 0,
                                    "location": 0,
                                    "sticker": 0
                                };
                                result[exist].userId = value.userId;
                                result[exist].displayName = decodeURIComponent(value.displayName);
                                result[exist][value.messageType] += 1;
                            });

                            for (let x = 0; x < result.length; x++) {
                                for (let y = x; y < result.length; y++) {
                                    if (result[x][messageType] < result[y][messageType]) {
                                        let temp = result[x];
                                        result[x] = result[y];
                                        result[y] = temp;
                                    }
                                }
                            }
                            resolve(result.filter(value => (value.userId != "UNKNOWN" && value[messageType] != 0)).map((value, index) => ((index + 1) + ". " + value.displayName + ": " + value[messageType])).splice(0, rankCount).join("\n"));
                        });
                    } else restart(1000);
                }, time);
            })(0);
        });
    },
    searchHistoryWithKeyWords: function () {

    },
    getFile: function (event, SourceData, FileId) {
        let Fileinfo = {
            id: undefined,
            type: undefined,
            ImgContentUrl: undefined,
            VideoContentUrl: undefined,
            AudioContentUrl: undefined,
            FileContentUrl: undefined,
            Filename: undefined
        };
        Chatlog.get('SELECT * FROM ' + SourceData.id + ' WHERE message LIKE "%id: ' + FileId + '"').then(data => {
            Fileinfo.type = data.messageType;
            Fileinfo.id = data.timestamp;
            if (data.messageType == 'file') {
                Fileinfo.Filename = data.message.split(',')[0].split('Filename: ')[1];
            }
            switch (Fileinfo.type) {
                case 'image':
                    break;
                case 'video':
                    break;
                case 'audio':
                    break;
                case 'file':
                    break;
            }
        });
    }
}