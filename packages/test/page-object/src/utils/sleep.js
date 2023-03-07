import signalToReject from './signalToReject';

// TODO: Remove this when we no longer support global installed clock.

// Lolex may get installed and impact the sleep.
const globalSetTimeout = setTimeout;

export default function sleep(duration = 1000, signal) {
  return Promise.race([new Promise(resolve => globalSetTimeout(resolve, duration)), signalToReject(signal)]);
}
