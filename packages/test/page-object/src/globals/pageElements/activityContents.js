import activities from './activities';

export default function getActivityContents() {
  return [].map.call(activities(), element => element.querySelector('.webchat__bubble__content'));
}
