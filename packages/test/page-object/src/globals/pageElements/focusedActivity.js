import getActiveActivity from './activeActivity';
import transcript from './transcript';

export default function focusedActivity() {
  const activity = getActiveActivity();

  // If focus is on the Adaptive Card or <input> inside the activity, it is considered as focused.
  // if (activity && (document.activeElement === transcript() || isSelfOrAncestor(activity, document.activeElement))) {
  if (activity && (document.activeElement === transcript() || activity.contains(document.activeElement))) {
    return activity;
  }
}
