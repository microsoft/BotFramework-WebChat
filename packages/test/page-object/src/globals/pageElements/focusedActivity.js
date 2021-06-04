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

  // If focus is on the Adaptive Card or <input> inside the activity, it is considered as focused.
  if (activity && (document.activeElement === transcript() || isSelfOrAncestor(activity, document.activeElement))) {
    return activity;
  }
}
