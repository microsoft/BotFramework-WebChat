import getActivityElements from '../elements/activities';

export default function numActivitiesShown(numActivities) {
  return {
    message: `exactly ${numActivities} activities is shown`,
    fn: () => {
      // To run hooks (WebChatTest.runHook), the code internally create an activity.
      // Inside the activity renderer, it call hooks, but return empty visually.
      // This activity is invisible and should not count towards "minNumActivitiesShown".

      const numActivitiesShown = [].reduce.call(
        getActivityElements(),
        (numActivitiesShown, child) => numActivitiesShown + (child.children.length ? 1 : 0),
        0
      );

      return numActivitiesShown === numActivities;
    }
  };
}
