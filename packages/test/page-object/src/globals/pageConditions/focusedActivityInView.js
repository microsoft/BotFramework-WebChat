import became from './became';
import getFocusedActivity from '../pageElements/focusedActivity';
import scrollStabilized from './scrollStabilized';
import transcriptScrollable from '../pageElements/transcriptScrollable';

export default async function focusedActivityInView(message) {
  await scrollStabilized(`wait for focused activity in view${message ? ': ' + message : ''}`);

  await became(
    `focused activity scroll into view${message ? ': ' + message : ''}`,
    () => {
      const focusedActivity = getFocusedActivity();

      if (!focusedActivity) {
        return false;
      }

      const { offsetHeight: activityHeight, offsetTop: activityTop } = focusedActivity;
      const { offsetHeight: scrollableHeight, scrollTop: scrollableTop } = transcriptScrollable();

      const activityBottom = activityHeight + activityTop;
      const scrollableBottom = scrollableHeight + scrollableTop;

      return (
        // If the activity is smaller than the viewport, wait until the whole activity is wholly contained in the viewport.
        (activityTop + 1 >= scrollableTop &&
          activityTop - 1 <= scrollableBottom &&
          activityBottom + 1 >= scrollableTop &&
          activityBottom - 1 <= scrollableBottom) ||
        // If the activity is larger than the viewport, wait until the viewport is wholly contained in the activity.
        (scrollableTop + 1 >= activityTop &&
          scrollableTop - 1 <= activityBottom &&
          scrollableBottom + 1 >= activityTop &&
          scrollableBottom - 1 <= activityBottom)
      );
    },
    5000
  );
}
