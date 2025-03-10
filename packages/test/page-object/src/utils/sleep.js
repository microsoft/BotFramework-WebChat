import signalToReject from './signalToReject';

// Lolex may get installed and impact the sleep.
const globalSetTimeout = setTimeout;

export default function sleep(duration = 1000, signal) {
  return Promise.race([new Promise(resolve => globalSetTimeout(resolve, duration)), signalToReject(signal)]);
}
