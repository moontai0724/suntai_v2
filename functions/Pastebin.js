const najax = $ = require('najax');
const Config = require('../config/config.json');

if (!Config.Pastebin) {
    Config.Pastebin = { "api_dev_key": "", "api_user_key": "" };
    require('fs').writeFileSync('./config/config.json', JSON.stringify(Config));
}

module.exports = {
    /**
     * Post text to Pastebin.
     * @requires config.json With an API_Key.
     * @requires najax A module to send http requests.
     * @param {string} data Text to post.
     * @param {Boolean} [guest] Paste as guest?
     * @param {Number} [private] Public(0), unlisted(1), or private(2) post?
     * @param {string} [expire] Expire time of the post? Accept: Never(N), 10 Minutes(10M), 1 Hour(1H), 1 Day(1D), 1 Week(1W), 1 Month(1M), 6 Month(6M), 1 Year(1Y).
     * @param {string} [api_paste_name] name of the post.
     * @returns An url of the Code at Pastebin.
     * @throws When text fails to upload, reject with http error.
     */
    post: function (data, guest = false, private = 1, expire = "1D", title = "") {
        return new Promise(function (resolve, reject) {
            if (!data) reject('data param is required!');
            if (!(guest == true || guest == false)) reject('guest param err! Must be a boolean!');
            if (!/^[012]$/.test(private)) reject('private param must be a interger of 0-2!');
            if (!/^(N|10M|1H|1D|1W|1M|6M|1Y)$/.test(expire)) reject('expire param err! Accept: Never(N), 10 Minutes(10M), 1 Hour(1H), 1 Day(1D), 1 Week(1W), 1 Month(1M), 6 Month(6M), 1 Year(1Y).');
            $({
                type: "POST",
                url: "https://pastebin.com/api/api_post.php",
                data: {
                    api_dev_key: Config.Pastebin.api_dev_key,
                    api_user_key: guest ? "" : Config.Pastebin.api_user_key,
                    api_option: "paste",
                    api_paste_code: data,
                    api_paste_private: Number(private),
                    api_paste_expire_date: expire,
                    api_paste_name: title,
                },
                success: function (data, status, xhr) {
                    console.log('Pastebin post success: ', data);
                    resolve(data);
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