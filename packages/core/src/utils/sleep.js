export default function (interval) {
  return new Promise(resolve => setTimeout(resolve, interval));
}
