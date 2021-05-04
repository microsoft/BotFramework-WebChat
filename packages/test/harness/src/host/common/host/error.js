module.exports = reject => {
  return function error() {
    reject();
  };
};
