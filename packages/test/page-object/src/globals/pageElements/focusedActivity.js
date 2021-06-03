import transcript from './transcript';

function isSelfOrAncestor(parent, node) {
  while (node) {
    if (parent === node) {
      return true;
    }

    node = node.parentElement;
  }

  return false;
}

export default function focusedActivity() {
  const activity = document.getElementById(transcript().getAttribute('aria-activedescendant'));

  // Could be focusing on Adaptive Card or <input> inside the activity, we will consider it is focused.
  if (activity && (document.activeElement === transcript() || isSelfOrAncestor(activity, document.activeElement))) {
    return activity;
  }
}
