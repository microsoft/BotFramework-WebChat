import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const packagesDir = path.join(projectRoot, 'packages');

async function testPackageExports(packageDirs) {
  const testProjectName = `test-exports-${Date.now()}`;
  const testProjectDir = path.join(packagesDir, testProjectName);
  
  console.log(`Creating test project: ${testProjectName}`);
  await fs.mkdir(testProjectDir);

  try {
    for (const packageDir of packageDirs) {
      await testPackage(packageDir, testProjectDir, testProjectName);
    }
  } finally {
    console.log('Cleaning up...');
    await fs.rm(testProjectDir, { recursive: true, force: true });
    console.log('Cleanup complete.');
  }
}

async function testPackage(packageDir, testProjectDir, testProjectName) {
  const packageJsonPath = path.join(packagesDir, packageDir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  const packageName = packageJson.name;
  const packageVersion = packageJson.version || '0-0.0.0-0';

  console.log(`Testing package: ${packageName}`);
  
  console.log('Packing the package...');
  execSync(`npm pack --pack-destination "${testProjectDir}"`, { cwd: path.join(packagesDir, packageDir) });
  
  const packedFilePath = path.join(testProjectDir, `${packageName.replace('/', '-')}-${packageVersion}.tgz`);

  console.log('Setting up test project...');
  await fs.writeFile(path.join(testProjectDir, 'package.json'), JSON.stringify({
    name: testProjectName,
    dependencies: {
      [packageName]: `file:${packedFilePath}`
    },
    type: "module"
  }));

  console.log('Installing dependencies...');
  execSync(`npx lerna bootstrap --scope=${testProjectName} --no-ci`, { cwd: projectRoot, stdio: 'inherit' });

  const installedPackageJsonPath = path.join(testProjectDir, 'node_modules', packageName, 'package.json');
  const installedPackageJson = JSON.parse(await fs.readFile(installedPackageJsonPath, 'utf-8'));

  console.log('Testing exports...');
  const exports = installedPackageJson.exports;

  async function testExport(exportPath, exportType, exportEntry) {
    const actualExportPath = exportPath === '.' ? '' : exportPath;
    const importPath = path.join(packageName, actualExportPath).replace(/\\/g, '/');
    const testFilePath = path.join(testProjectDir, `test-${exportType}-${actualExportPath.replace(/\W/g, '_') || 'root'}.${exportType === 'require' ? 'cjs' : 'mjs'}`);
    
    let testFileContent;
    if (exportType === 'require') {
      testFileContent = `
        const imported = require('${importPath}');
        console.log('Successfully required:', typeof imported === 'object' ? Object.keys(imported) : typeof imported);
      `;
    } else {
      testFileContent = `
        import * as imported from '${importPath}';
        console.log('Successfully imported:', typeof imported === 'object' ? Object.keys(imported) : typeof imported);
      `;
    }

    await fs.writeFile(testFilePath, testFileContent);

    try {
      execSync(`node ${testFilePath}`, { cwd: testProjectDir, stdio: 'inherit' });
      console.log(`Successfully ${exportType === 'require' ? 'required' : 'imported'}: ${importPath}`);
    } catch (error) {
      console.error(`Failed to ${exportType}: ${importPath}`);
      console.error(error.stdout?.toString() || error.stderr?.toString() || error);
      throw error;
    }
  }

  async function processExport(key, value) {
    console.log(`Processing export: ${key}`);
    if (typeof value === 'string') {
      await testExport(key, 'import', value);
      await testExport(key, 'require', value);
    } else if (typeof value === 'object') {
      if (value.import) {
        if (typeof value.import === 'string') {
          await testExport(key, 'import', value.import);
        } else if (typeof value.import === 'object' && value.import.default) {
          await testExport(key, 'import', value.import.default);
        }
      }
      if (value.require) {
        if (typeof value.require === 'string') {
          await testExport(key, 'require', value.require);
        } else if (typeof value.require === 'object' && value.require.default) {
          await testExport(key, 'require', value.require.default);
        }
      }
    }
  }

  console.log('Exports structure:', JSON.stringify(exports, null, 2));

  if (typeof exports === 'string') {
    await processExport('.', exports);
  } else if (typeof exports === 'object') {
    for (const [key, value] of Object.entries(exports)) {
      await processExport(key, value);
    }
  }

  console.log(`All exports tested successfully for ${packageName}`);
}

// Get package directories from command line arguments or test all packages if no arguments provided
let packageDirs = process.argv.slice(2);
if (packageDirs.length === 0) {
  packageDirs = await fs.readdir(packagesDir);
  packageDirs = packageDirs.filter(dir => !dir.startsWith('test-exports-')); // Exclude our test projects
}

testPackageExports(packageDirs).catch(error => {
  console.error('An error occurred:', error);
  process.exit(1);
});