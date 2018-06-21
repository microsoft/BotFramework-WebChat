const fs = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const { version } = require(join(__dirname, '../package.json'));

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function main() {
  const targetPackageJSONFile = join(__dirname, '../packages/component/package.json');
  const targetPackageJSON = JSON.parse(await readFile(targetPackageJSONFile, 'utf-8'));

  await writeFile(targetPackageJSONFile, JSON.stringify({
    ...targetPackageJSON,
    version
  }, null, 2));
}

main().catch(err => {
  console.error(err);

  process.exit(-1);
});
