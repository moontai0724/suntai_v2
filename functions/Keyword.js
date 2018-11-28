const path = require("path");
const fs = require("fs");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));
const DataBase = require(path.join(process.cwd(), "functions", "DataBase.js"));

var keywords = [];
module.exports = {
    judge: function (event) {
        return new Promise((resolve, reject) => {
            // init
            if (keyword.length == 0) {
                fs.readdir(path.join(process.cwd(), "functions", "Keywords"), (err, files) => {
                    files.forEach(value => keywords.push(require(path.join(process.cwd(), "functions", "Keywords", value))));
                });
            }

            keywords.forEach(value => {
                if (value.regex.test(event.message.text))
                    value.response(event).then(resolve, reject);
            });

            DataBase.readTable('Keyword').then(keyword => {
                keyword.forEach(value => {
                    if (value.dataType == "text" && /F(ull)?C(ompare)?/i.test(value.method)) {
                        if (event.message.text == decodeURIComponent(value.keyword))
                            resolve(MsgFormat.Text(decodeURIComponent(value.data)));
                    } else if (value.dataType == "text" && /P(art)?C(ompare)?/i.test(value.method)) {
                        if (event.message.text.indexOf(decodeURIComponent(value.keyword)) > -1)
                            resolve(MsgFormat.Text(decodeURIComponent(value.data)));
                    } else if (value.dataType == "Regexp") {
                        if (new RegExp(decodeURIComponent(value.keyword)).test(event.message.text))
                            resolve(MsgFormat.Text(decodeURIComponent(value.data)));
                    }
                });
            });
        });
    }
};