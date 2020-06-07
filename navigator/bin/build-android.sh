yarn sync-config-xml
cd src-cordova
rm -f app-release.apk
rm -f app-release-unsigned.apk
mkdir -p www
echo ">> [build-android] building unsigned APK"
cd ..
yarn cordova-build-android
cd src-cordova
cp ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk app-release-unsigned.apk
echo ">> [build-android] signing APK"
jarsigner -sigalg SHA1withRSA -digestalg SHA1 -keystore ./fastlane/gram-net.keystore app-release-unsigned.apk gram-net -storepass gram-net
zipalign -v 4 app-release-unsigned.apk app-release.apk
echo ">> [build-android] APK signed './src-cordova/app-release.apk'"

