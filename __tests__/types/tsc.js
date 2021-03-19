const ts = require('typescript');
const program = ts.createProgram(['./test1.tsx'], {
  allowSyntheticDefaultImports: true,
  jsx: 'react',
  noEmit: true,
  skipLibCheck: true
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

// If the "errors" array contains 1 or more lines, there are compilation errors.
if (errors.length) {
  console.log(errors.join('\n'));
} else {
  console.log('No errors');
}
