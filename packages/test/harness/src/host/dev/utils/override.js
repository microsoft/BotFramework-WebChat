// Override a function by pre/post functions, and optionally async function.

// Assume the original function signature is (x: number, y: number) => number.
// - "pre" will be (x: number, y: number) => [number, number], which intercept and modify the passing arguments;
// - "post" will be (number) => number, which intercept and modify the returning value.

// Sample code:

// const fn = (x, y) => x + y;

// overrodeFn = override(
//   fn,
//   (x, y) => [x * 10, y],
//   result => `Result is ${result}.`
// );

// fn(1, 2) === 3
// overrodeFn(1, 2) === 'Result is 12.'

module.exports = function override(fn, pre = (...args) => args, post = result => result) {
  return async (...args) => post(await fn(...((await pre(...args)) || [])));
};
