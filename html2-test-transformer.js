const { relative, resolve } = require('path');

const testRoot = resolve(__dirname, './__tests__/html2/');

module.exports = {
  process: (_, sourcePath) => {
    const html = relative(testRoot, sourcePath);
    const shouldSkip = sourcePath.endsWith('.skip.html');

    return {
      code: `
        test${shouldSkip ? '.skip' : ''}(${JSON.stringify(html)}, () =>
          runHTML(${JSON.stringify(`/__tests__/html2/${html}`)}));
      `
    };
  }
};
