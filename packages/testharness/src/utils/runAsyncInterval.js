const globalSetTimeout = setTimeout;

export default function runAsyncInterval(fn, intervalInMS) {
  let timeout;
  const schedule = () => {
    timeout = globalSetTimeout(async () => {
      await fn();
      schedule();
    }, intervalInMS);
  };

  schedule();

  return () => clearTimeout(timeout);
}
