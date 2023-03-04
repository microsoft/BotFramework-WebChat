import signalToReject from './signalToReject';

export default function sleep(duration = 1000, signal) {
  return Promise.race([new Promise(resolve => setTimeout(resolve, duration)), signalToReject(signal)]);
}
