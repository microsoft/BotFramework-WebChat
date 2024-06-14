import getActivities from './activities';
import root from './root';
import transcript from './transcript';

export default function activeActivity() {
  const activeDescendant = root().getElementById(transcript().getAttribute('aria-activedescendant'));
  const activities = [...getActivities()];

  return activities.find(activity => activity.contains(activeDescendant));
}
