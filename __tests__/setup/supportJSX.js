// We have multple .babelrc files. Some load JSX and some don't.
// For those don't load JSX, we will not setup WebDriver for it.

// This is for checking if the current Babel is running with "preset-react" under Jest.
// If it is loaded, importing this file should not cause any exceptions.

module.exports = function() {
  <div />;
};
