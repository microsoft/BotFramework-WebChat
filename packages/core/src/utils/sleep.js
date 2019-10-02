export default function sleep(interval) {
  return new Promise(resolve => setTimeout(resolve, interval));
}
