export default function subscribeAll(observable) {
  return new Promise((resolve, reject) => {
    const values = [];

    observable.subscribe({
      complete() {
        resolve(values);
      },
      error(error) {
        reject(error);
      },
      next(value) {
        values.push(value);
      }
    });
  });
}
