import activities from './activities';

export default function getActivityContents() {
  return [].map.call(activities(), element => element.querySelector('.bubble__content'));
}
