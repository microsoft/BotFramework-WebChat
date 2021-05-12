import transcript from './transcript';

export default function activities() {
  return transcript().querySelectorAll('.webchat__basic-transcript__activity');
}
