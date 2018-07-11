module.exports = {
    /**
     * Get time.
     * @param {Number} [tms] Timestamp.
     * @param {Number} [timezoneOffset] (Optional) Spicific a timezone.
     * @default +8
     * @returns {string} YYYY-MM-DD HH:MM:SS:MSS
     * @example 2018-06-30 00:00:00:000
     */
    getTimeString: function (tms, timezoneOffset) {
        return getTimeBase(0, tms, timezoneOffset);
    },
    /**
     * Get time with promise handle.
     * @param {Number} [tms] Timestamp.
     * @param {Number} [timezoneOffset] (Optional) Spicific a timezone.
     * @default +8
     * @returns {JSON} A json format of time.
     * @example {
     *    "year": 2018,
     *    "month": 06,
     *    "date": 30,
     *    "hour": 00,
     *    "minute": 00,
     *    "second": 00,
     *    "millisecond": 000
     * }
     */
    getTimePromise: function (tms, timezoneOffset) {
        return new Promise(function (resolve) {
            resolve(getTimeBase(1, tms, timezoneOffset));
        });
    },
    /**
     * Get now timestamp.
     * @param {Number} [timezoneOffset] (Optional) Spicific a timezone.
     * @default +8
     * @returns {string} YYYY-MM-DD HH:MM:SS:MSS
     * @example 2018-06-30 00:00:00:000
     */
    getTimestamp: function (timezoneOffset) {
        return getTimeBase(2, undefined, timezoneOffset);
    }
};

function getTimeBase(mode, tms, timezoneOffset) {
    let time, millisecond, second, minute, hour, date, month, year;
    if (tms && tms != undefined) {
        time = new Date(Date.UTC((new Date(tms)).getUTCFullYear(), (new Date(tms)).getUTCMonth(), (new Date(tms)).getUTCDate(), (new Date(tms)).getUTCHours() + timezoneOffset != undefined ? timezoneOffset : 8, (new Date(tms)).getUTCMinutes(), (new Date(tms)).getUTCSeconds(), (new Date(tms)).getUTCMilliseconds()));
        millisecond = time.getUTCMilliseconds();
        second = time.getUTCSeconds();
        minute = time.getUTCMinutes();
        hour = time.getUTCHours();
        date = time.getUTCDate();
        month = time.getUTCMonth() + 1; // 獲取到的時間是從 0 開始，因此 +1
        year = time.getUTCFullYear();
    } else {
        time = new Date(Date.UTC((new Date()).getUTCFullYear(), (new Date()).getUTCMonth(), (new Date()).getUTCDate(), (new Date()).getUTCHours() + 8, (new Date()).getUTCMinutes(), (new Date()).getUTCSeconds(), (new Date()).getUTCMilliseconds()));
        millisecond = time.getUTCMilliseconds();
        second = time.getUTCSeconds();
        minute = time.getUTCMinutes();
        hour = time.getUTCHours();
        date = time.getUTCDate();
        month = time.getUTCMonth() + 1; // 獲取到的時間是從 0 開始，因此 +1
        year = time.getUTCFullYear();
    }

    // 時間格式化
    if (millisecond < 10) { millisecond = '00' + millisecond; }
    else if (millisecond < 100) { millisecond = '0' + millisecond; }
    if (second < 10) { second = '0' + second; }
    if (minute < 10) { minute = '0' + minute; }
    if (hour < 10) { hour = '0' + hour; }
    if (date < 10) { date = '0' + date; }
    if (month < 10) { month = '0' + month; }

    if (mode == 0) {
        return year + '/' + month + '/' + date + ' ' + hour + ':' + minute + ':' + second + ':' + millisecond;
    } else if (mode == 1) {
        return {
            "year": year,
            "month": month,
            "date": date,
            "hour": hour,
            "minute": minute,
            "second": second,
            "millisecond": millisecond
        };
    } else if (mode == 2) {
        return time.getTime();
    }
}