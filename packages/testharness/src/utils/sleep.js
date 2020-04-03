// setTimeout can be polluted by Lolex, we save the version before it happen.
const globalClearTimeout = clearTimeout;
const globalSetTimeout = setTimeout;

export default function sleep(durationInMS, abortSignal) {
  return new Promise(resolve => {
    const timeout = globalSetTimeout(resolve, durationInMS);

    abortSignal && abortSignal.addEventListener('abort', () => globalClearTimeout(timeout));
  });
}
