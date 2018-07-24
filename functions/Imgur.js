const najax = $ = require('najax');
const UTC8Time = require('./UTC8Time.js');
const Config = require('../config/config.json');

if (!Config.Imgur) {
    Config.Imgur = { "refresh_token": "", "client_id": "", "client_secret": "" };
    require('fs').writeFileSync('./config/config.json', JSON.stringify(Config));
}

module.exports = {
    /**
     * Upload Image to Imgur by a url.
     * @requires config.json An OAuth refresh token, client id and client secret in config.json file.
     * @requires najax A module to send http requests.
     * @param {string} imgurl A url of an image to upload.
     * @param {string} [description] Texts to describe the image
     * @returns An url of the image at Imgur.
     * @throws When image fails to upload, reject with http error.
     */
    uploadByUrl: function (imgurl, description) {
        return new Promise(function (resolve, reject) {
            $({
                type: "POST",
                url: "https://api.imgur.com/oauth2/token",
                contentType: "application/x-www-form-urlencoded;",
                data: 'refresh_token=' + Config.Imgur.refresh_token + '&' +
                    'client_id=' + Config.Imgur.client_id + '&' +
                    'client_secret=' + Config.Imgur.client_secret + '&' +
                    'grant_type=refresh_token',
                success: function (data) {
                    data = JSON.parse(data);
                    $({
                        type: "POST",
                        url: 'https://api.imgur.com/3/image',
                        headers: {
                            Authorization: 'Bearer ' + data.access_token,
                        },
                        data: {
                            "image": imgurl,
                            "album": "HUUim",
                            "type": "URL",
                            "description": description ? description : ''
                        },
                        success: function (data, status, xhr) {
                            data = JSON.parse(data);
                            console.log('Image Upload Success', data);
                            resolve(data.data.link);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(UTC8Time.getTimeString(), 'Responsed jqXHR: ', jqXHR);
                            console.log(UTC8Time.getTimeString(), 'Responsed textStatus: ', textStatus);
                            console.log(UTC8Time.getTimeString(), 'Responsed errorThrown: ', errorThrown);
                            reject(jqXHR);
                        }
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(UTC8Time.getTimeString(), 'Responsed jqXHR: ', jqXHR);
                    console.log(UTC8Time.getTimeString(), 'Responsed textStatus: ', textStatus);
                    console.log(UTC8Time.getTimeString(), 'Responsed errorThrown: ', errorThrown);
                    reject(jqXHR);
                }
            });
        });
    }
};