# 日太 suntai
A project of chatbot which use Developer Trial plan.

## 安裝與執行
- Windows `StartServer.bat` 
- Linux  先執行 `ngrok http 127.0.0.1:8080` 再執行 `StartServer.sh`

## 特點
* 自動讀取指令，只需對資料夾新增資料即可

## 注意事項
* 需要一個 `config.json` 檔案，在第一次執行後會自動在跟目錄產生 config 資料夾，內含 `config.json` 檔案。`config.json` 檔案必須至少含有 `line webhook` 的 `channelSecret` 跟 `channelAccessToken`。
* Bot 用到 sqlite database，若沒有已經可以使用的 database (database/settings.sqlite) 將無法正常運作 **(現行的版本會自動產生)**。
* 其他[常見問題](FAQ.md)

### Database (database/settings.sqlite) 內容
在第一次執行的時候，會自動產生database。

**group** -> 加入的群組
`CREATE TABLE 'group' (
    'id'    TEXT UNIQUE,
    'comment'    TEXT,
    PRIMARY KEY('id')
);`

**room** -> 加入的聊天室
`CREATE TABLE 'room' (
    'id'    TEXT UNIQUE,
    'comment'    TEXT,
    PRIMARY KEY('id')
);`

**user** -> 加入的好友
`CREATE TABLE 'user' (
    'id'    TEXT UNIQUE,
    'comment'    TEXT,
    PRIMARY KEY('id')
);`

**userIds** -> 所有記錄到的使用者
`CREATE TABLE 'userIds' (
    'id'    TEXT UNIQUE,
    'comment'    TEXT,
    PRIMARY KEY('id')
);`

**Owners** -> 管理員
`CREATE TABLE 'Owners' (
    'id'	TEXT UNIQUE,
    PRIMARY KEY('id')
);`

**OwnersNotice** -> 會接收提醒的管理員
`CREATE TABLE 'OwnersNotice' (
    'id'	TEXT UNIQUE,
    PRIMARY KEY('id')
);`

**Variables** -> 變數
`CREATE TABLE 'Variables' (
    'id'    TEXT UNIQUE,
    'data'  TEXT,
    PRIMARY KEY('id')
);`
