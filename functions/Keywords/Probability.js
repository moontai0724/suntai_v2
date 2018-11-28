const path = require("path");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));

module.exports = {
    description: "求...的機率，回應 0 ~ 100 %。",
    regex: /求[\s\S]*的機率/,
    response: function (event) {
        return new Promise((resolve, reject) => {
            resolve(MsgFormat.Text(Math.floor(Math.random() * 100) + " ％です。"));
        });
    }
};