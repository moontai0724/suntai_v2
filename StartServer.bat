start /MIN ngrok http 8080
:start
cd suntaidev
git fetch https://github.com/moontai0724/suntaidev.git master
git reset --hard FETCH_HEAD
git clean -df
CMD /C npm install
node app.js
cd..
goto start