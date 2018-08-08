// npm install @line/bot-sdk koa koa-bodyparser koa-router najax ping-net sqlite xml2js
const LineBotSDK = require('@line/bot-sdk');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const KoaBodyParser = require('koa-bodyparser');

// nodejs built-in package
const crypto = require('crypto');
const fs = require('fs');

// packages
const najax = $ = require('najax');
const parseString = require('xml2js').parseString;
const sqlite = require('sqlite');
const ping = require('ping-net');

// Own functions
const Authorize = require('./functions/Authorize.js');
const Chatlog = require('./functions/Chatlog.js');
const CommandsList = require('./functions/CommandsList.js');
const DataBase = require('./functions/DataBase.js');
const Earthquake = require('./functions/Earthquake.js');
const Imgur = require('./functions/Imgur.js');
const MsgFormat = require('./functions/MsgFormat.js');
const UTC8Time = require('./functions/UTC8Time.js');

if (fs.existsSync('./config')) {
    if (!fs.existsSync('./config/config.json')) {
        fs.writeFileSync('./config/config.json', '{\n\t"LineBot": {\n\t\t"channelSecret": "",\n\t\t"channelAccessToken": ""\n\t}\n}');
    }
} else {
    fs.mkdirSync('./config');
    fs.writeFileSync('./config/config.json', '{\n\t"LineBot": {\n\t\t"channelSecret": "",\n\t\t"channelAccessToken": ""\n\t}\n}');
}

const Config = require('./config/config.json');
const app = new Koa();
const router = new KoaRouter();
const LineBotClient = new LineBotSDK.Client(Config.LineBot);

app.use(KoaBodyParser());

// Webhook
router.post('/', ctx => {
    if (ctx.request.header['user-agent'] && ctx.request.header['user-agent'].includes('LineBotWebhook')) {
        if (LineBotSDK.validateSignature(ctx.request.rawBody, Config.LineBot.channelSecret, ctx.request.headers['x-line-signature'])) {
            ctx.status = 200;
            ctx.request.body.events.map(MessageHandler);
        } else {
            ctx.status = 401;
            ctx.body = 'Authorize failed.';
            console.log('Received a fake Line webhook!');
            DataBase.readTable('OwnersNotice').then(ownersNotice => {
                for (let i = 0; i < ownersNotice.length; i++) {
                    LineBotClient.pushMessage(ownersNotice[i].id, MsgFormat.Text(UTC8Time.getTimeString() + '\nReceived a fake Line webhook!'));
                }
            });
        }
    } else if (ctx.request.header['user-agent'] && ctx.request.header['user-agent'].includes('GitHub')) {
        if (ctx.request.header['x-hub-signature'] == 'sha1=' + crypto.createHmac('SHA1', Config.GitHub.webhookSecret).update(ctx.request.rawBody).digest('hex')) {
            ctx.status = 200;
            ctx.body = 'Server Restarted.';
            server.close(() => {
                console.log('Received GitHub push message, server restarted.');
                process.exit();
            });
        } else {
            ctx.status = 401;
            ctx.body = 'Authorize failed.';
            console.log('Received a fake GitHub webhook!');
            DataBase.readTable('OwnersNotice').then(ownersNotice => {
                for (let i = 0; i < ownersNotice.length; i++) {
                    LineBotClient.pushMessage(ownersNotice[i].id, MsgFormat.Text(UTC8Time.getTimeString() + '\nReceived a fake GitHub webhook!'));
                }
            });
        }
    } else {
        ctx.status = 404;
        console.log('Received an unknown request!');
        console.log(ctx.request);
        DataBase.readTable('OwnersNotice').then(ownersNotice => {
            for (let i = 0; i < ownersNotice.length; i++) {
                LineBotClient.pushMessage(ownersNotice[i].id, MsgFormat.Text(UTC8Time.getTimeString() + '\nReceived an unknown request!'));
            }
        });
    };
});

app.use(router.routes());

// Service Startup
const server = app.listen(8080);

// Handle messages
async function MessageHandler(event) {
    switch (event.type) {
        case 'message':
            setTimeout(() => Chatlog.log(event), 500);
            if (event.message.type == 'text') {
                if (event.message.text.startsWith('/') && !event.message.text.startsWith('//')) {
                    // Returned data(s) must formatted!
                    if (event.message.text.toLowerCase().startsWith('/mt')) {
                        try {
                            if (!await Authorize.Owner(event.source.userId)) {
                                LineBotClient.replyMessage(event.replyToken, MsgFormat.Text("403 Forbidden: No permission."));
                                return 0;
                            }
                        } catch (err) {
                            LineBotClient.replyMessage(event.replyToken, MsgFormat.Text(err));
                            return 0;
                        }
                    }

                    CommandsList.check(event.message.text.replace('/', '').split(' ')).then(async function (data) {
                        console.log(data);
                        event.message.originalText = event.message.text;
                        event.data = data;
                        event.message.text = event.message.text = event.message.text.split(' ').filter((value, index) => {
                            return !((data.parents + ' ' + data.name).split(' ')[index] ? (new RegExp(((data.parents + ' ' + data.name).split(' ')[index]), "i", "^", "$")).test(value) || (new RegExp((data.parents + ' ' + data.name).split(' ')[index].replace(/[^A-Z]/g, ''), "i", "^", "$").test(value)) : false);
                        }).join(' ');

                        data.data.MessageHandler(event).then(message => {
                            if (message[0]) {
                                let change = [];
                                message.forEach(value => {
                                    if (value.type == 'text' && value.text.length > 2000) {
                                        let replyMsgArr = [];
                                        for (let i = 0, o = 0; i < Math.ceil(value.text.length / 2000); ++i, o += 2000) replyMsgArr[i] = value.text.substr(o, 2000);
                                        value.text = replyMsgArr[0];
                                        for (let i = 1; i < replyMsgArr.length; i++) {
                                            change[change.length] = { "text": replyMsgArr[i], "previousText": replyMsgArr[i - 1] };
                                        }
                                    }
                                });
                                change.forEach(data => message.splice(message.findIndex(value => value.text == data.previousText) + 1, 0, MsgFormat.Text(data.text)));
                            } else if (message.type == 'text' && message.text.length > 2000) {
                                let replyMsgArr = [];
                                for (let i = 0, o = 0; i < Math.ceil(message.text.length / 2000); ++i, o += 2000) replyMsgArr[i] = message.text.substr(o, 2000);
                                message = replyMsgArr.map(value => MsgFormat.Text(value));
                            }

                            if ((message[0] && message.length <= 5) || !message[0]) LineBotClient.replyMessage(event.replyToken, message);
                            else LineBotClient.replyMessage(event.replyToken, MsgFormat.Text('訊息數量超過五則訊息限制而無法發送，請縮小執行動作的範圍，若認為是錯誤請告知開發者。'));
                        }, err => LineBotClient.replyMessage(event.replyToken, MsgFormat.Text(err)));
                    }, err => LineBotClient.replyMessage(event.replyToken, MsgFormat.Text(err)));
                }
            }
            break;
        case 'follow':
            break;
        case 'unfollow':
            break;
        case 'join':
            switch (event.source.type) {
                case 'group':
                    DataBase.readTable('Groups').then(groups => {
                        if (groups.indexOf(event.source.groupId) == -1) DataBase.insertValue('Groups', event.source.groupId);
                        else console.log('Groups ' + event.source.roomId + ' is not in database.');
                    });
                    DataBase.readTable('OwnersNotice').then(ownersNotice => {
                        for (let i = 0; i < ownersNotice.length; i++) {
                            LineBotClient.pushMessage(ownersNotice[i].id, MsgFormat.Text(UTC8Time.getTimeString() + '\n日太加入了群組: ' + event.source.groupId));
                        }
                    });
                    break;
                case 'room':
                    DataBase.readTable('Rooms').then(rooms => {
                        if (rooms.indexOf(event.source.roomId) == -1) DataBase.insertValue('Rooms', event.source.roomId);
                        else console.log('Room ' + event.source.roomId + ' is not in database.');
                    });
                    DataBase.readTable('OwnersNotice').then(ownersNotice => {
                        for (let i = 0; i < ownersNotice.length; i++) {
                            LineBotClient.pushMessage(ownersNotice[i].id, MsgFormat.Text(UTC8Time.getTimeString() + '\n日太加入了聊天: ' + event.source.roomId));
                        }
                    });
                    break;
            }
            LineBotClient.replyMessage(event.replyToken, MsgFormat.Text('您好，我是日太！在和我互動前請先詳讀以下事項：' +
                '\n1. 由於 Developer Trial 帳號限制最大好友數為 50 人，因此請勿加入好友。' +
                '\n　 由於 Developer Trial 帳號限制最大好友數為 50 人，因此請勿加入好友！' +
                '\n　 由於 Developer Trial 帳號限制最大好友數為 50 人，因此請勿加入好友！！\n' +
                '\n2. 如需獲得任何指令協助，請輸入：/st help' +
                '\n3. 指令協助中，大寫字母代表簡易指令。' +
                '\n以上就是日太的操作說明與提醒事項囉！' +
                '\n\nDeveloper：月太 moontai0724' +
                '\nHomepage：https://home.gamer.com.tw/moontai0724' +
                '\nSource Code: https://github.com/moontai0724/suntaidev'));
            break;
        case 'leave':
            switch (event.source.type) {
                case 'group':
                    DataBase.readTable('Groups').then(groups => {
                        if (groups.indexOf(event.source.groupId) > -1) DataBase.deleteWithId('Groups', event.source.groupId);
                        else console.log('Groups ' + event.source.roomId + ' is not in database.');
                    });
                    DataBase.readTable('OwnersNotice').then(ownersNotice => {
                        for (let i = 0; i < ownersNotice.length; i++) {
                            LineBotClient.pushMessage(ownersNotice[i].id, MsgFormat.Text(UTC8Time.getTimeString() + '\n日太離開了群組: ' + event.source.groupId));
                        }
                    });
                    break;
                case 'room':
                    DataBase.readTable('Rooms').then(rooms => {
                        if (rooms.indexOf(event.source.roomId) > -1) DataBase.deleteWithId('Rooms', event.source.roomId);
                        else console.log('Room ' + event.source.roomId + ' is not in database.');
                    });
                    DataBase.readTable('OwnersNotice').then(ownersNotice => {
                        for (let i = 0; i < ownersNotice.length; i++) {
                            LineBotClient.pushMessage(ownersNotice[i].id, MsgFormat.Text(UTC8Time.getTimeString() + '\n日太離開了聊天: ' + event.source.roomId));
                        }
                    });
                    break;
            }
            break;
    }
}

// Startup notice
(async function () {
    DataBase.readTable('OwnersNotice').then(ownersNotice => {
        for (let i = 0; i < ownersNotice.length; i++) {
            LineBotClient.pushMessage(ownersNotice[i].id, MsgFormat.Text(UTC8Time.getTimeString() + '\n日太已啟動完成。'));
        }
    });
})();

// Check ngrok connection every 30 minutes
(function checkConnect(ms = 5000) {
    setTimeout(function () {
        ping.ping({ address: 'localhost', port: 4040, attempts: 2 }, pingResponse => {
            if (pingResponse[0].avg) {
                najax.get('http://127.0.0.1:4040/api/tunnels', ngrokInfo => {
                    let url = JSON.parse(ngrokInfo).tunnels[0].public_url.split('://')[1].split('.')[0];
                    DataBase.readTable('Variables', 'ngrokURL').then(data => {
                        console.log(data);
                        if (!data) {
                            console.log('There is no ngrokURL data in database.');
                            DataBase.insertValue('Variables', ['ngrokURL', url]).then(() => LineBotClient.pushMessage('R9906a7c54c6d722a5d523d937f32e677', [MsgFormat.Text(UTC8Time.getTimeString() + '\n網址已變更，請手動更改網址為： ' + url + '.ngrok.io\n\nline: https://developers.line.me/console/channel/1558579961/basic/' + '\ngithub: https://github.com/moontai0724/suntaidev/settings/hooks/24784567'), MsgFormat.Text(url)]));
                        } else if (data[0].data != url) {
                            console.log('ngrokURL changed, write into database.');
                            DataBase.updateValue('Variables', 'ngrokURL', { "data": url }).then(() => LineBotClient.pushMessage('R9906a7c54c6d722a5d523d937f32e677', [MsgFormat.Text(UTC8Time.getTimeString() + '\n網址已變更，請手動更改網址為： ' + url + '.ngrok.io\n\nline: https://developers.line.me/console/channel/1558579961/basic/' + '\ngithub: https://github.com/moontai0724/suntaidev/settings/hooks/24784567'), MsgFormat.Text(url)]));
                        } else {
                            LineBotClient.pushMessage('R9906a7c54c6d722a5d523d937f32e677', MsgFormat.Text(UTC8Time.getTimeString() + '\n目前日太於 ' + url + ' 運作狀況良好。'));
                        }
                    });
                });
            } else {
                console.log('There is no ngrok connection now!');
                LineBotClient.pushMessage('R9906a7c54c6d722a5d523d937f32e677', MsgFormat.Text(UTC8Time.getTimeString() + '\n目前沒有 ngrok 連線。'));
            }
        });
        UTC8Time.getTimePromise().then(time => checkConnect((((30 - time.minute % 30) * 60) - time.second) * 1000 - time.millisecond + 5000));
    }, ms);
})();

// Earthquake check
Earthquake.opendata();