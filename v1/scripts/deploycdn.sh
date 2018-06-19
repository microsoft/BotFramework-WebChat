# Install blobxfer
curl -L -o ~/blobxfer https://github.com/Azure/blobxfer/releases/download/1.2.1/blobxfer-1.2.1-linux-x86_64
chmod +x ~/blobxfer

PACKAGE_NAME=$(node -p require\(\'$TRAVIS_BUILD_DIR/package.json\'\).name)
PACKAGE_VERSION=$(node -p require\(\'$TRAVIS_BUILD_DIR/package.json\'\).version)
echo Will publish to CDN at $PACKAGE_NAME/$PACKAGE_VERSION/*

# Copy files that should be distributed to CDN
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

# Upload to based on version from package.json
~/blobxfer upload --local-path $TRAVIS_BUILD_DIR/dist --remote-path $PACKAGE_NAME/$PACKAGE_VERSION --storage-account $CDN_BLOB_ACCOUNT --storage-account-key $CDN_BLOB_KEY

# If TRAVIS_TAG is present, it means this is going PRODUCTION
if [ -n "$TRAVIS_TAG" ]
then
# Upload to /latest/
~/blobxfer upload --local-path $TRAVIS_BUILD_DIR/dist --remote-path $PACKAGE_NAME/latest --storage-account $CDN_BLOB_ACCOUNT --storage-account-key $CDN_BLOB_KEY
fi

# If on "master" branch, deploy to "master" tag too
if [ "$TRAVIS_BRANCH" = "master" ]
then
# Upload to /master/
~/blobxfer upload --local-path $TRAVIS_BUILD_DIR/dist --remote-path $PACKAGE_NAME/master --storage-account $CDN_BLOB_ACCOUNT --storage-account-key $CDN_BLOB_KEY
fi
