var sass = require('node-sass');

var result = sass.renderSync({
  file: process.argv[2],
  outputStyle: 'expanded'
});

process.stdout.write(result.css.toString('utf8'));
