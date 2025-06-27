import activities from './activities';

export default function getActivityStatuses() {
  return [].map.call(activities(), element =>
    element.querySelector('.webchat__carousel-filmstrip__status, .stacked-layout__status')
  );
}
