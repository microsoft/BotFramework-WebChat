const ts = require('typescript');
const path = require('path');

function compile(...filenames) {
const program = ts.createProgram(filenames, {
  allowSyntheticDefaultImports: true,
  jsx: 'react',
  noEmit: false,
  skipLibCheck: true,
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

if (errors.length > 0)

return errors;
};


it('dir should pass dir as string', () => {
  const dirStringErrors = compile(path.join(__dirname, './dirString.tsx'));

  expect(dirStringErrors).toHaveProperty('length', 0);
});

it('dir should fail on dir as number', () => {
  const dirNumErrors = compile(path.join(__dirname, './dirNumber.tsx'));

  expect(dirNumErrors).toHaveProperty('length', 1);
});

it('styleOptions should fail on accent', () => {
  const dirStringErrors = compile(path.join(__dirname, './styleOptionsAccent.tsx'));

  expect(dirStringErrors).toHaveProperty('length', 0);
});

it('styleOptions should pass on cardEmphasisBackgroundColor', () => {
  const dirStringErrors = compile(path.join(__dirname, './styleOptionsCardEmph.tsx'));

  expect(dirStringErrors).toHaveProperty('length', 1);
});
