export default function sleep(durationMs = 1000) {
  return new Promise(resolve => setTimeout(resolve, durationMs));
}
