module.exports = resolve =>
  function ready() {
    resolve();
  };
