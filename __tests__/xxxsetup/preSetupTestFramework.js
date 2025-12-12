// We have multple .babelrc files. Some load JSX and some don't.
// For those don't load JSX, we will not setup WebDriver for it.

// Checks if JSX is being transpiled in the current Jest run.
// If JSX is not being transpiled, the require() call will fail with SyntaxError.

function supportJSX() {
  try {
    // We don't need to call the exported function.
    return require('./supportJSX');
  } catch (err) {}
}

supportJSX() && require('./setupTestFramework');
