import getActivities from './activities';
import transcript from './transcript';

export default function activeActivity() {
  const activeDescendant = document.getElementById(transcript().getAttribute('aria-activedescendant'));
  const activities = [...getActivities()];

  return activities.find(activity => activity.contains(activeDescendant));
}
