export default function cognitiveServicesPromiseToESPromise(promise) {
  return new Promise((resolve, reject) => promise.on(resolve, reject));
}
