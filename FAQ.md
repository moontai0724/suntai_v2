# 常見問題

## npm 無法安裝 sqlite
若無法成功安裝`splite`，有以下兩種處理方法：

1. 打開issue並且告知此問題
2. 移除`package-lock.json`

## 找不到../config/config.json 模塊
請見注意事項，需要一個`config.json`檔案，在
第一次執行後會自動在跟目錄產生`config`資料夾，
內含`config.json`檔案。`config.json`檔案必須至
少含有`line webhook`的`channelSecret`跟`channelAccessToken`。

如果啟動之後沒有產生相關檔案，請手動建立
並放入以下內容：

``` Json
{
    "LineBot": {
        "channelSecret": "",
        "channelAccessToken": ""
    }
}
```

## 未啟動 ngrok
出現以下訊息表示沒有啟動ngrok
```
There is no ngrok connection now!
```

請確認執行前有先行啟動ngrok

## Line Developers 無法設定 Webhook URL
請確保`ngrok`運作正常，並且確定`ngrok`有成功
Forwarding到日太測試ngrok，從外部連線確保可以
正確看到內容，並且本機測試`8080`端口可以對應
到日太。

該問題可能會出現以下訊息
- `ngrok 502 Bad Gateway`

下列方法也許可以解決這個問題
- 改用`ngrok http 127.0.0.1:8080`而不是`ngrok http 8080`

## Error: listen EADDRINUSE :::8080
8080可能被佔用
