const path = require("path");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));

module.exports = {
    description: "回應使用者指定的話。",
    regex: /^\@日太 說/,
    response: function (event) {
        return new Promise((resolve, reject) => {
            resolve(MsgFormat.Text(event.message.text.replace("@日太 說", "")));
        });
    }
};