module.exports = resolve => {
  return function ready() {
    resolve();
  };
};
