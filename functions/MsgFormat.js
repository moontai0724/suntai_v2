module.exports = {
    /**
     * Format message to a JSON format which line accept.
     * @param {string} replyText A string of text to format, max 2000 characters. Can include Unicode emoji or LINE original emoji. (https://developers.line.me/media/messaging-api/emoji-list.pdf)
     */
    Text: function (replyText) {
        return {
            "type": "text",
            "text": replyText
        };
    },
    /**
     * Format message to a JSON format which line accept.
     * @param {Number} packageId Package ID for a set of stickers. (Sticker list: https://developers.line.me/media/messaging-api/sticker_list.pdf)
     * @param {Number} stickerId Sticker id. (Sticker list: https://developers.line.me/media/messaging-api/sticker_list.pdf)
     * @example Sticker(1, 1);
     */
    Sticker: function (packageId, stickerId) {
        return {
            "type": "sticker",
            "packageId": Number(packageId),
            "stickerId": Number(stickerId)
        };
    },
    /**
     * Format message to a JSON format which line accept.
     * @param {string} imageSrc HTTPS URL of image file. (Max: 1000 characters)
     * @param {string} [previewImageSrc] (Optional) HTTPS URL of image file used for preview,. If not provided, will use imageSrc for it. (Max: 1000 characters)
     * @example Image("https://example.com/original.jpg");
     * @example Image("https://example.com/original.jpg","https://example.com/preview.jpg");
     */
    Image: function (imageSrc, previewImageSrc) {
        return {
            "type": "image",
            "originalContentUrl": imageSrc,
            "previewImageUrl": previewImageSrc ? previewImageSrc : imageSrc
        };
    },
    /**
     * Format message to a JSON format which line accept.
     * @param {string} videoSrc HTTPS URL of video file. (Max: 1000 characters)
     * @param {string} previewImageSrc HTTPS URL of image file used for preview. (Max: 1000 characters)
     * @example Video("https://example.com/original.mp4", "https://example.com/preview.jpg");
     */
    Video: function (videoSrc, previewImageSrc) {
        return {
            "type": "video",
            "originalContentUrl": videoSrc,
            "previewImageUrl": previewImageSrc
        };
    },
    /**
     * Format message to a JSON format which line accept.
     * @param {string} audioSrc HTTPS URL of audio file. (Max: 1000 characters)
     * @param {Number} durationMs The length of the audio in millisecond.
     * @example Audio("https://example.com/original.m4a", 60000);
     */
    Audio: function (audioSrc, durationMs) {
        return {
            "type": "audio",
            "originalContentUrl": audioSrc,
            "duration": Number(durationMs)
        };
    },
    /**
     * Format message to a JSON format which line accept.
     * @param {string} title A title of the address, max 100 characters. (Only used for display)
     * @param {string} address The target address, max 100 characters. (Only used for display)
     * @param {Number} latitude The latitude of the address. (Used for positioning)
     * @param {Number} longitude The longitude of the address. (Used for positioning)
     * @example Location("Taipei 101", "110 台北市信義區信義路五段7號", 25.0339639, 121.5644722);
     * @example Location("My Location", "〒150-0002 東京都渋谷区渋谷２丁目２１−１", 35.65910807942215, 139.70372892916203);
     */
    Location: function (title, address, latitude, longitude) {
        return {
            "type": "location",
            "title": title,
            "address": address,
            "latitude": Number(latitude),
            "longitude": Number(longitude)
        };
    }
};