const ts = require('typescript');
const path = require('path');

function compile(...filenames) {
  const program = ts.createProgram(filenames, {
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

  return errors;
}

it('should pass with non-exported component type SendTextBox', () => {
  const componentErrors = compile(path.join(__dirname, './__typescript__/componentSendTextBox.tsx'));

  expect(componentErrors).toHaveLength(0);
});

it('should pass with non-exported type directLine', () => {
  const directLineErrors = compile(path.join(__dirname, './__typescript__/directLineObject.tsx'));

  expect(directLineErrors).toHaveLength(0);
});

it('should pass with non-exported type directLine in Composer', () => {
  const directLineErrors = compile(path.join(__dirname, './__typescript__/directLineInComposer.tsx'));

  expect(directLineErrors).toHaveLength(0);
});

it('should pass dir as string in Composer ', () => {
  const dirStringErrors = compile(path.join(__dirname, './__typescript__/dirInComposer.tsx'));

  expect(dirStringErrors).toHaveLength(0);
});

it('should pass dir as string', () => {
  const dirStringErrors = compile(path.join(__dirname, './__typescript__/dirString.tsx'));

  expect(dirStringErrors).toHaveLength(0);
});

it('should fail on dir as number', () => {
  const dirNumErrors = compile(path.join(__dirname, './__typescript__/dirNumber.tsx'));

  expect(dirNumErrors).toHaveProperty('length', 1);
  expect(dirNumErrors[0]).toEqual(
    expect.stringContaining(`Type 'number' is not assignable to type '"ltr" | "rtl" | "auto"'`)
  );
});

it('should pass with non-exported type store', () => {
  const storeObjectErrors = compile(path.join(__dirname, './__typescript__/storeObject.tsx'));

  expect(storeObjectErrors).toHaveLength(0);
});

it('should pass with non-exported type store in Composer ', () => {
  const storeObjectErrors = compile(path.join(__dirname, './__typescript__/storeInComposer.tsx'));

  expect(storeObjectErrors).toHaveLength(0);
});

it('should pass on accent', () => {
  const accentErrors = compile(path.join(__dirname, './__typescript__/styleOptionsAccent.tsx'));

  expect(accentErrors).toHaveLength(0);
});

it('should pass on cardEmphasisBackgroundColor', () => {
  const cardEmphErrors = compile(path.join(__dirname, './__typescript__/styleOptionsCardEmph.tsx'));

  expect(cardEmphErrors).toHaveProperty('length', 1);
  expect(cardEmphErrors[0]).toEqual(
    expect.stringContaining(`Type '{ cardEmphasisBackgroundColor: string; }' is not assignable to type 'StyleOptions'`)
  );
});
