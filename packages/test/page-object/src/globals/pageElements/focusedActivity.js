import transcript from './transcript';

export default function focusedActivity() {
  return document.activeElement === transcript()
    ? document.getElementById(transcript().getAttribute('aria-activedescendant'))
    : // If the transcript is not focused, active descendant means nothing, returns undefined (no activity is focused).
      undefined;
}
