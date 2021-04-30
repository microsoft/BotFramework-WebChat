import became from './became';
import focusedActivity from '../../elements/focusedActivity';
import transcriptScrollable from '../../elements/transcriptScrollable';
import scrollStabilized from './scrollStabilized';

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
        (activityTop >= scrollableTop &&
          activityTop <= scrollableBottom &&
          activityBottom >= scrollableTop &&
          activityBottom <= scrollableBottom) ||
        (scrollableTop >= activityTop &&
          scrollableTop <= activityBottom &&
          scrollableBottom >= activityTop &&
          scrollableBottom <= activityBottom)
      );
    },
    5000
  );
}
