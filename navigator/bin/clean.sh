echo ">> [clean] removing git untracked files and generated APK's"
git clean -fdX
ln -s ../.env .env
rm -f ./src-cordova/app-release.apk
rm -f ./src-cordova/app-release-unsigned.apk
echo ">> [clean] finished"