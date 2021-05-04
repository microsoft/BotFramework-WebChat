module.exports = reject => {
  return function error(error) {
    reject(error);
  };
};
