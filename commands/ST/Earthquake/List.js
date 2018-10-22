const path = require("path");

// Own functions
const MsgFormat = require(path.join(process.cwd(), "functions", "MsgFormat.js"));

module.exports = {
	description: '獲取可設定的地震通知縣市。',
	MessageHandler: function (event) {
		return new Promise(async function (resolve, reject) {
			resolve(MsgFormat.Text('請以數字或縣市名稱選擇接收通知地區，當選擇的地區地震最大震度三級即會通知。請使用指令：/ST Earthquake SET <地區編號>\n0. 全 1. 臺北市 2. 新北市 3. 桃園市 4. 臺中市 5. 臺南市 6. 高雄市 7. 基隆市 8. 新竹市 9. 嘉義市 10. 新竹縣 11. 苗栗縣 12. 彰化縣 13. 南投縣 14. 雲林縣 15. 嘉義縣 16. 屏東縣 17. 宜蘭縣 18. 花蓮縣 19. 臺東縣 20. 澎湖縣 21. 金門縣 22. 連江縣'));
		});
	}
};