// setTimeout may get overwritten when lolex is installed.
// globalSetTimeout is to save the original setTimeout before it get overwritten.

const globalSetTimeout = window.setTimeout.bind(window);

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
