import transcript from './transcript';

export default function activities() {
  return Object.freeze(Array.from(transcript()?.querySelectorAll('.webchat__basic-transcript__activity') || []));
}
