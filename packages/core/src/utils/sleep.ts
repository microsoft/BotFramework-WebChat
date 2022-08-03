export default function sleep(interval: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, Math.max(interval, 0)));
}
