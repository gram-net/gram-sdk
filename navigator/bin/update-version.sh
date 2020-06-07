sed -i -E 's/(<widget.+version=")[^"]*(".+)/\1'$1'\2/' src-cordova/config.xml
git add . src-cordova/config.xml