import getActivities from '../pageElements/activities';

export default function getActivityBoundingBoxes() {
  return [].map.call(getActivities(), activity => {
    const boundingBox = activity.querySelector('.webchat__basic-transcript__activity-active-descendant');

    const left = activity.offsetLeft + boundingBox.offsetLeft;
    const top = activity.offsetTop + boundingBox.offsetTop;
    const { offsetHeight: height, offsetWidth: width } = boundingBox;

    return {
      bottom: top + height,
      height,
      left,
      right: left + width,
      top,
      width
    };
  });
}
