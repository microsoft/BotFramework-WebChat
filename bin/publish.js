var fs = require('fs-extra');

// npm package
fs.emptyDirSync('./npm/dist');
fs.copySync('./built', './npm/dist', f => f.endsWith('.js'));
fs.copySync('./static', './npm/dist', { clobber: false });

// cdn files
fs.emptyDirSync('./cdn');
fs.copySync('./static', './cdn');
fs.copySync('./webpacked/botchat.js', './cdn/botchat.js');
