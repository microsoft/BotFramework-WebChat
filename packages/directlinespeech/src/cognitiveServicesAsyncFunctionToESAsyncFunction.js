import cognitiveServicesPromiseToESPromise from './cognitiveServicesPromiseToESPromise';

export default function cognitiveServicesAsyncFunctionToESAsyncFunction(fn) {
  return (...args) => cognitiveServicesPromiseToESPromise(fn(...args));
}
