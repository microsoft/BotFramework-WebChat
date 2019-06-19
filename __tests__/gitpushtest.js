// This uses simple-git to execute git commands from node.js.
//
// Before executing,
//   Delete tag gittest_tag from github.
//   Delete file dummy.txt from github.
//   Delete folder BotFramework-WebChat.

const USER = 'Some One';
const EMAIL = 'some@one.com';
const PASS = 'somewhere';
const REPO = 'github.com/microsoft/BotFramework-WebChat';

const git = require('simple-git/promise');
const remote = `https://${REPO}`;
const rootDir = 'BotFramework-WebChat';
const newTempDir = 'tempDir'

var fs = require('fs');

//function sleep(ms) {
//    return new Promise(resolve => {
//        setTimeout(resolve, ms)
//    })
//}

async function gittest() {
    console.log("begin gittest()");
    // First, set up a local repo.
    // Go to parent of root folder.
    await process.chdir('../..');
    // Set up new directory tempDir.
    await fs.mkdirSync(newTempDir);
    console.log(".chdir(newTempDir)");
    await process.chdir(newTempDir);

    // List dir contents
    console.log("fs.readdir('.'");
    fs.readdir('.', function (err, items) {
        console.log('Number of items found:', items.length);
        console.log(items);

        for (var i = 0; i < items.length; i++) {
            console.log(items[i]);
        }
    });
    
    console.log(".clone(", remote);
    await git().silent(true)
        .clone(remote)
        .then((result) => console.log('clone finished:', result))
        .catch((err) => console.error('clone failed: ', err));

    //while (!fs.existsSync(rootDir)) {
    //    await sleep(250);
    //    console.log("...waiting...");
    //}
    console.log("process.chdir(", rootDir);
    await process.chdir(rootDir);

    //console.log(".addConfig('user.name',");
    //await git().addConfig('user.name', USER)
    //    .then((result) => console.log("addConfig 1 finished: ", result))
    //    .catch((err) => console.error('addConfig 1 failed: ', err));
    //await git().addConfig('user.email', EMAIL)
    //    .then((result) => console.log("addConfig 2 finished: ", result))
    //    .catch((err) => console.error('addConfig 2 failed: ', err));

    console.log(".raw(['config' user");
    await git().raw(['config', '--global', 'user.name', USER])
        .then((result) => console.log(".raw(['config' name finished: ", result))
        .catch((err) => console.error(".raw(['config' name failed: ", err));
    await git().raw(['config', '--global', 'user.email', EMAIL])
        .then((result) => console.log(".raw(['config' email finished: ", result))
        .catch((err) => console.error(".raw(['config' email failed: ", err));

    console.log("git().status() 1");
    await git().status()
        .then((result) => console.log("status 1 finished: ", result))
        .catch((err) => console.error('status 1 failed: ', err));

    console.log(".checkout('master')");
    await git().checkout('master')
        .then((result) => console.log("checkout finished: ", result))
        .catch((err) => console.error('checkout failed: ', err));

    console.log(".pull('origin', 'master')");
    await git().pull('origin', 'master')
        .then((result) => console.log("pull finished: ", result))
        .catch((err) => console.error('pull failed: ', err));

    // // Create new local branch
    // git().checkoutLocalBranch('v-bruhal-githubpushtest')
    //     .then((result) => console.log("checkoutLocalBranch finished: ", result))
    //     .catch((err) => console.error('checkoutLocalBranch failed: ', err));

    // // Push new branch to origin
    // git().push('origin', 'v-bruhal-githubpushtest')
    //     .then((result) => console.log("push finished: ", result))
    //     .catch((err) => console.error('push failed: ', err));

    console.log(".addTag('gittest_tag')");
    await git().addTag('gittest_tag')
        .then((result) => console.log("addTag finished: ", result))
        .catch((err) => console.error('addTag failed: ', err));

    await git().status()
        .then((result) => console.log("status 2 finished: ", result))
        .catch((err) => console.error('status 2 failed: ', err));

    // Push new tag to origin
    console.log(".push('origin', '--tags')");
    await git().push('origin', '--tags')
        .then((result) => console.log("push finished: ", result))
        .catch((err) => console.error('push failed: ', err));
    // Delete the tag with:
    // git tag -d gittest_tag
    // git push origin :refs/tags/gittest_tag

    // Create new file
    console.log("fs.writeFile('dummy.txt'");
    await fs.writeFile('dummy.txt', 'Dummy test file', function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });

    // Add file to staging
    console.log(".add('dummy.txt')");
    await git().add('dummy.txt')
        .then((result) => console.log("add finished: ", result))
        .catch((err) => console.error('add failed: ', err));

    await git().status()
        .then((result) => console.log("status 3 finished: ", result))
        .catch((err) => console.error('status 3 failed: ', err));

    console.log(".commit('Committed by");
    await git().commit('Committed by gittest2.js - v-bruhal')
        .then((result) => console.log("commit finished: ", result))
        .catch((err) => console.error('commit failed: ', err));

    // Push master branch to origin
    console.log(".push('origin', 'master')");
    await git().push('origin', 'master')
        .then((result) => console.log("push finished: ", result))
        .catch((err) => console.error('push failed: ', err));

    // // Push branch to origin
    // git().push('origin', 'v-bruhal-githubpushtest')
    //     .then((result) => console.log("push finished: ", result))
    //     .catch((err) => console.error('push failed: ', err));

    // Delete the file with:
    // git rm dummy.txt
    // git commit -m "remove dummy.txt"

    await git().status()
        .then((result) => console.log("status 4 finished: ", result))
        .catch((err) => console.error('status 4 failed: ', err));
    console.log("end gittest()");
}

console.log("gittest2: calling gittest()");
gittest();
//console.log("end of gittest2");

