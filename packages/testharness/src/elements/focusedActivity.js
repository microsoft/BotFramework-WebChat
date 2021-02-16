import transcript from './transcript';

export default function focusedActivity() {
  return document.getElementById(transcript().getAttribute('aria-activedescendant'));
}
