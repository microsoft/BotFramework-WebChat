var fs = require('fs');
var sass = require('node-sass');

function compile(fileNameWithoutExtension) {
  var result = sass.renderSync({
    file: './src/scss/' + fileNameWithoutExtension + '.scss',
    outputStyle: 'expanded'
  });

  fs.writeFileSync('./' + fileNameWithoutExtension + '.css', result.css);
}

var args  = process.argv.slice(2);
args.forEach(compile);
