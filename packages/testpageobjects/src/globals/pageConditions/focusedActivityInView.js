import became from './became';
import focusedActivity from '../pageElements/focusedActivity';
import transcriptScrollable from '../pageElements/transcriptScrollable';
import scrollStabilized from './scrollStabilized';

export default async function focusedActivityInView(message) {
  await scrollStabilized(`wait for focused activity in view${message ? ': ' + message : ''}`);

  await became(
    `focused activity scroll into view${message ? ': ' + message : ''}`,
    () => {
      let { offsetHeight: activityHeight, offsetTop: activityTop } = focusedActivity();
      let { offsetHeight: scrollableHeight, scrollTop: scrollableTop } = transcriptScrollable();

      const activityBottom = Math.ceil(activityHeight + activityTop);
      const scrollableBottom = Math.ceil(scrollableHeight + scrollableTop);

      activityTop = ~~activityTop;
      scrollableTop = ~~scrollableTop;

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
