module.exports = function override(fn, pre = (...args) => args, post = result => result) {
  return async (...args) => await post(await fn(...((await pre(...args)) || [])));
};
