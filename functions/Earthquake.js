const path = require("path");

// Require Line Bot SDK
const LineBotSDK = require('@line/bot-sdk');

// Require config
const Config = require(path.join(process.cwd(), "config", "config.json"));
const LineBotClient = new LineBotSDK.Client(Config.LineBot);

// packages
const najax = $ = require('najax');
const parseString = require('xml2js').parseString;

// Own functions
const DataBase = require(path.join(__dirname, "DataBase.js"));
const MsgFormat = require(path.join(__dirname, "MsgFormat.js"));
const Imgur = require(path.join(__dirname, "Imgur.js"));

module.exports = {
    /**
     * Automatically send earthquake infomations to users, DO NOT call it twice or more.
     * @requires sqlite A module to use sqlite.
     * @requires najax A module to use http request.
     * @requires xml2js A module to parse xml string.
     */
    opendata: function () {
        setInterval(function () {
            $.get("http://opendata.cwb.gov.tw/govdownload?dataid=E-A0015-001R&authorizationkey=rdec-key-123-45678-011121314", data => {
                parseString(data.replace(/\&amp\;/g, "&").replace(/\&/g, "&amp;"), (err, result) => {
                    DataBase.readTable('Variables', 'EarthquakeLastKnowTime').then(earthquakeLastKnowTime => {
                        let originTime = new Date(result.cwbopendata.dataset[0].earthquake[0].earthquakeInfo[0].originTime[0]).toLocaleString('zh-tw', { hour12: false });
                        if (originTime != earthquakeLastKnowTime[0].data) {
                            let msg = result.cwbopendata.dataset[0].earthquake[0].reportContent[0];

                            let depth = result.cwbopendata.dataset[0].earthquake[0].earthquakeInfo[0].depth[0]._;
                            let latitude = result.cwbopendata.dataset[0].earthquake[0].earthquakeInfo[0].epicenter[0].epicenterLat[0]._ + "°N";
                            let longitude = result.cwbopendata.dataset[0].earthquake[0].earthquakeInfo[0].epicenter[0].epicenterLon[0]._ + "°E";
                            let location = result.cwbopendata.dataset[0].earthquake[0].earthquakeInfo[0].epicenter[0].location[0];
                            let magnitude = Number(result.cwbopendata.dataset[0].earthquake[0].earthquakeInfo[0].magnitude[0].magnitudeValue[0]);

                            let reportimg = 'https://' + result.cwbopendata.dataset[0].earthquake[0].reportImageURI[0].split('://')[1];
                            let weburl = result.cwbopendata.dataset[0].earthquake[0].web[0];

                            let shakingArea = [], shakingAreaMax = [], shakingAreaCount = 0;

                            for (x = 0; x < result.cwbopendata.dataset[0].earthquake[0].intensity[0].shakingArea.length; x++) {
                                if (result.cwbopendata.dataset[0].earthquake[0].intensity[0].shakingArea[x].areaDesc[0].indexOf('最大震度') == -1) {
                                    shakingArea[shakingAreaCount++] = {
                                        "areaName": result.cwbopendata.dataset[0].earthquake[0].intensity[0].shakingArea[x].areaName[0],
                                        "areaIntensity": Number(result.cwbopendata.dataset[0].earthquake[0].intensity[0].shakingArea[x].areaIntensity[0]._),
                                        "sub": []
                                    };
                                    for (y = 0; y < result.cwbopendata.dataset[0].earthquake[0].intensity[0].shakingArea[0].eqStation.length; y++) {
                                        shakingArea[shakingAreaCount - 1].sub[y] = {
                                            "stationName": result.cwbopendata.dataset[0].earthquake[0].intensity[0].shakingArea[0].eqStation[y].stationName[0],
                                            "stationIntensity": Number(result.cwbopendata.dataset[0].earthquake[0].intensity[0].shakingArea[0].eqStation[y].stationIntensity[0]._)
                                        }
                                    }
                                } else {
                                    shakingAreaMax[x - shakingAreaCount] = {
                                        "areaName": result.cwbopendata.dataset[0].earthquake[0].intensity[0].shakingArea[x].areaName[0],
                                        "areaIntensity": Number(result.cwbopendata.dataset[0].earthquake[0].intensity[0].shakingArea[x].areaIntensity[0]._)
                                    };
                                }
                            }

                            let url = originTime.split('-')[1] + originTime.split('-')[2].split(' ')[0] + originTime.split(' ')[1].split(':')[0] + originTime.split(' ')[1].split(':')[1] + String(magnitude).replace('.', '').substring(0, 2) + String(result.cwbopendata.dataset[0].earthquake[0].earthquakeNo).replace('107', '');

                            DataBase.updateValue('Variables', 'EarthquakeLastKnowTime', { data: originTime });

                            let allmsg = '【地震報告】\n' + msg +
                                '\n\n時間： ' + originTime +
                                '\n規模：芮氏規模 ' + magnitude +
                                '\n深度： ' + depth + ' 公里' +
                                '\n經緯度： ' + latitude + ', ' + longitude +
                                '\n相對位置： ' + location +
                                '\n查看網頁（中央氣象局）： https://www.cwb.gov.tw/V7/earthquake/Data/quake/EC' + url + '.htm' +
                                '\n查看網頁（地震測報中心）： ' + weburl;
                            console.log(allmsg);

                            DataBase.readTable('EarthquakeNotification').then(earthquake_notification_list => {
                                let NoticeList = [];
                                for (let x = 0; x < earthquake_notification_list.length; x++) {
                                    for (let y = 0; y < shakingArea.length; y++) {
                                        if (earthquake_notification_list[x].area.indexOf(shakingArea[y].areaName) > -1 && Number(shakingArea[y].areaIntensity) >= 3) {
                                            let NoticeArea = '\n設定之通知地區震度：';
                                            for (let i = 0; i < shakingArea.length; i++) {
                                                if (earthquake_notification_list[x].area.indexOf(shakingArea[i].areaName) > -1) {
                                                    NoticeArea += '\n' + shakingArea[i].areaName + ' 地區最大震度 ' + shakingArea[i].areaIntensity + ' 級';
                                                }
                                            }
                                            if (NoticeArea == '\n設定之通知地區震度：' || earthquake_notification_list[x].area.length == 22) {
                                                NoticeArea = '';
                                            }
                                            NoticeList[NoticeList.length] = {
                                                id: earthquake_notification_list[x].id,
                                                area: NoticeArea
                                            };
                                            y = shakingArea.length;
                                        }
                                    }
                                }

                                for (let i = 0; i < NoticeList.length; i++) {
                                    LineBotClient.pushMessage(NoticeList[i].id, MsgFormat.Text(allmsg + NoticeList[i].area));
                                }
                                Imgur.uploadByUrl(reportimg, allmsg).then(pic_link => {
                                    for (let i = 0; i < NoticeList.length; i++) {
                                        LineBotClient.pushMessage(NoticeList[i].id, MsgFormat.Image(pic_link, pic_link));
                                    }
                                });
                            });
                        }
                    }, err => {
                        console.error(err);
                    });
                });
            });
        }, 60000);
    }
}