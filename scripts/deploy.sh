# sudo echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-trusty-prod/ trusty main" > azure.list
# sudo cp ./azure.list /etc/apt/sources.list.d/
# apt-key adv --keyserver packages.microsoft.com --recv-keys B02C46DF417A0893

curl -L -o ~/blobxfer https://github.com/Azure/blobxfer/releases/download/1.2.1/blobxfer-1.2.1-linux-x86_64
chmod +x ~/blobxfer

# node -p require\(\'../package.json\'\).version

PACKAGE_VERSION=$(node -p require\(\'../package.json\'\).version)
echo $PACKAGE_VERSION

~/blobxfer upload --local-path $TRAVIS_BUILD_DIR/package.json --remote-path botframework-webchat/$PACKAGE_VERSION --storage-account webchattest --storage-account-key $AZURE_BLOB_KEY
