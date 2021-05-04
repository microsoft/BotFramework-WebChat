import became from './became';
import focusedActivity from '../pageElements/focusedActivity';
import scrollStabilized from './scrollStabilized';
import transcriptScrollable from '../pageElements/transcriptScrollable';

export default async function focusedActivityInView(message) {
  await scrollStabilized(`wait for focused activity in view${message ? ': ' + message : ''}`);

  await became(
    `focused activity scroll into view${message ? ': ' + message : ''}`,
    () => {
      const { offsetHeight: activityHeight, offsetTop: activityTop } = focusedActivity();
      const { offsetHeight: scrollableHeight, scrollTop: scrollableTop } = transcriptScrollable();

      const activityBottom = activityHeight + activityTop;
      const scrollableBottom = scrollableHeight + scrollableTop;

      return (
        (activityTop + 1 >= scrollableTop &&
          activityTop - 1 <= scrollableBottom &&
          activityBottom + 1 >= scrollableTop &&
          activityBottom - 1 <= scrollableBottom) ||
        (scrollableTop + 1 >= activityTop &&
          scrollableTop - 1 <= activityBottom &&
          scrollableBottom + 1 >= activityTop &&
          scrollableBottom - 1 <= activityBottom)
      );
    },
    5000
  );
}
