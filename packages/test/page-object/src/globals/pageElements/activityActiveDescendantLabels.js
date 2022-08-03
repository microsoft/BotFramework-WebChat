import activities from './activities';

export default function getActivityActiveDescendantLabels() {
  return [].map.call(activities(), element =>
    element.querySelector('.webchat__basic-transcript__activity-active-descendant')
  );
}
