export default function intercept(fn, interceptFn = next => value => next(value)) {
  return interceptFn(fn);
}
