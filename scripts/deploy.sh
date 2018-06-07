# sudo echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-trusty-prod/ trusty main" > azure.list
# sudo cp ./azure.list /etc/apt/sources.list.d/
# apt-key adv --keyserver packages.microsoft.com --recv-keys B02C46DF417A0893

curl -L -o ~/blobxfer https://github.com/Azure/blobxfer/releases/download/1.2.1/blobxfer-1.2.1-linux-x86_64
chmod +x ~/blobxfer

# node -p require\(\'../package.json\'\).version

PACKAGE_VERSION=$(node -p require\(\'$TRAVIS_BUILD_DIR/package.json\'\).version)
echo Will publish to CDN as $PACKAGE_VERSION

mkdir $TRAVIS_BUILD_DIR/dist

cp $TRAVIS_BUILD_DIR/adaptivecards-hostconfig.json $TRAVIS_BUILD_DIR/dist
cp $TRAVIS_BUILD_DIR/botchat-fullwindow.css $TRAVIS_BUILD_DIR/dist
cp $TRAVIS_BUILD_DIR/botchat.css $TRAVIS_BUILD_DIR/dist
cp $TRAVIS_BUILD_DIR/botchat.js $TRAVIS_BUILD_DIR/dist
cp $TRAVIS_BUILD_DIR/botchat.js.map $TRAVIS_BUILD_DIR/dist
cp $TRAVIS_BUILD_DIR/botchat-es5.js $TRAVIS_BUILD_DIR/dist
cp $TRAVIS_BUILD_DIR/botchat-es5.js.map $TRAVIS_BUILD_DIR/dist
cp $TRAVIS_BUILD_DIR/CognitiveServices.js $TRAVIS_BUILD_DIR/dist
cp $TRAVIS_BUILD_DIR/CognitiveServices.js.map $TRAVIS_BUILD_DIR/dist

~/blobxfer upload --local-path $TRAVIS_BUILD_DIR/dist --remote-path botframework-webchat/$PACKAGE_VERSION --storage-account webchattest --storage-account-key $AZURE_BLOB_KEY
