const { relative, resolve } = require('path');
const fs = require('fs');

const testRoot = resolve(__dirname, './__tests__/html2/');

const extractTitle = htmlPath => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const contents = fs.readFileSync(htmlPath, 'utf8');
  const match = contents.match(/<title>(.*?)<\/title>/u);
  return match ? match[1] : '';
};

module.exports = {
  process: (_, sourcePath) => {
    const html = relative(testRoot, sourcePath);
    const shouldSkip = sourcePath.endsWith('.skip.html');
    const title = extractTitle(sourcePath);

    return {
      code: `
      describe(${JSON.stringify(title)}, () => {
        test${shouldSkip ? '.skip' : ''}(${JSON.stringify(html)}, () =>
          runHTML(${JSON.stringify(`/__tests__/html2/${html}`)}));
      });
      `
    };
  }
};
