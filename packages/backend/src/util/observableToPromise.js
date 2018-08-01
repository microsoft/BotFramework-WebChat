export default function (observable) {
  return new Promise((resolve, reject) => {
    observable.subscribe(resolve, reject);
  });
}
