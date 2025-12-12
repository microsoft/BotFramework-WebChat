import { Condition } from 'selenium-webdriver';

import getActivityElements from '../elements/getActivityElements';

export default function minNumActivitiesShown(numActivities) {
  return new Condition(`${numActivities} activities is shown`, async driver => {
    // To run hooks (WebChatTest.runHook), the code internally create an activity.
    // Inside the activity renderer, it call hooks, but return empty visually.
    // This activity is invisible and should not count towards "minNumActivitiesShown".

    const activityElements = await getActivityElements(driver);

    const numActivitiesShown = await driver.executeScript(
      activityElements =>
        [].reduce.call(
          activityElements,
          (numActivitiesShown, child) => numActivitiesShown + (child.children.length ? 1 : 0),
          0
        ),
      activityElements
    );

    return numActivitiesShown >= numActivities;
  });
}
