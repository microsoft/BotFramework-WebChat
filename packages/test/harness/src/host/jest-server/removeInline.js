module.exports = function removeInline(array, element) {
  const index = array.indexOf(element);

  ~index && array.splice(index, 1);
};
