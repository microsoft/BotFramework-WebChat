export default function signalToReject(signal) {
  return new Promise(
    (_, reject) => signal && signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
  );
}
