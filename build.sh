#! /bin/bash

readonly VERSION_FILE="VERSION"
readonly REL_FILE_PREFIX="botv2-web"
readonly TOP_PID=$$
readonly BRANCH="master"
trap "exit 1" TERM

exit_script() {
    kill -s TERM $TOP_PID
}

build() {
    local release_file="${REL_FILE_PREFIX}_$1.zip"
    docker build -t botv2-web . &&
        docker create --name botv2-web-image botv2-web &&
        docker cp botv2-web-image:/src/release "./release" &&
        docker rm botv2-web-image
    if [ "$?" -ne 0 ]
    then
        echo "Failed to build release"
        exit_script
    fi

    # Change Version in file
    sed -i "s/VERSION_HERE/$1/" release/bot.html
    zip -r "$release_file" release/
}

get_updated_version() {
    major=$(cut -d '.' -f 1 ${VERSION_FILE})
    minor=$(cut -d '.' -f 2 ${VERSION_FILE} | xargs -I '{}' expr '{}' + 1 )
    patch=$(cut -d '.' -f 3 ${VERSION_FILE})
    echo "${major}.${minor}.${patch}"
}

main() {
    version=$(get_updated_version)
    build $version
}

main
