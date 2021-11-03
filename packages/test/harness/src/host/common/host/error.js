module.exports = reject =>
  function error(error) {
    reject(error);
  };
