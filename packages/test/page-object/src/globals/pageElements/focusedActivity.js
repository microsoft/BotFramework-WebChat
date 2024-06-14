import getActiveActivity from './activeActivity';
import root from './root';
import transcript from './transcript';

export default function focusedActivity() {
  const { activeElement } = root();
  const activity = getActiveActivity();

  // If focus is on the Adaptive Card or <input> inside the activity, it is considered as focused.
  // if (activity && (document.activeElement === transcript() || isSelfOrAncestor(activity, document.activeElement))) {
  if (activity && (activeElement === transcript() || activity.contains(activeElement))) {
    return activity;
  }
}
