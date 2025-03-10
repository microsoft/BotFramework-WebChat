export default function sleep(durationInMS) {
  return new Promise(resolve => setTimeout(resolve, durationInMS));
}
