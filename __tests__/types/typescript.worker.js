const ts = require('typescript');
const workerThreads = require('node:worker_threads');

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

workerThreads.parentPort.addListener('message', ({ args, port }) => {
  try {
    port.postMessage({ returnValue: compile(...args) });
  } catch ({ message }) {
    port.postMessage({ error: message });
  }
});
