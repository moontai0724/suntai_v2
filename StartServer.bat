start /MIN ngrok http 8080
:start
cd suntai_v2
git fetch https://github.com/moontai0724/suntai_v2.git master
git reset --hard FETCH_HEAD
git clean -df
CMD /C npm install
node app.js
cd..
goto start
