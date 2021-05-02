module.exports = function removeInline(array, element) {
  const index = array.indexOf(element);

  ~index && pool.splice(index, 1);
};
