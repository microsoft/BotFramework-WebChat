const { join, relative } = require('path');
const { readdir } = require('fs').promises;

const ts = require('typescript');

function compile(...filenames) {
  const program = ts.createProgram(filenames, {
    allowSyntheticDefaultImports: true,
    jsx: 'react',
    noEmit: true,
    skipLibCheck: true,
    strict: true
  });

  const emitResult = program.emit();
  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  const errors = [];

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

      errors.push(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      errors.push(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  return errors;
}

describe('compiling TypeScript files', () => {
  describe('in /pass/ folder', () => {
    let results;

    beforeEach(async () => {
      const path = join(__dirname, '__typescript__/pass/');
      const files = await readdir(path);

      results = {};

      files.forEach(file => {
        const fullPath = join(path, file);

        results[relative(path, fullPath)] = { errors: compile(fullPath) };
      });
    });

    test('should pass', () => {
      for (const filename of Object.keys(results)) {
        expect(results).toHaveProperty([filename, 'errors'], []);
        expect(results).toHaveProperty([filename, 'errors', 'length'], 0);
      }
    });
  });

  describe('in /fail-once/ folder', () => {
    let results;

    beforeEach(async () => {
      const path = join(__dirname, '__typescript__/fail-once/');
      const files = await readdir(path);

      results = {};

      files.forEach(file => {
        const fullPath = join(path, file);

        results[relative(path, fullPath)] = { errors: compile(fullPath) };
      });
    });

    test('should fail only once', () => {
      for (const filename of Object.keys(results)) {
        expect(results).toHaveProperty([filename, 'errors', 'length'], 1);
      }
    });
  });
});
