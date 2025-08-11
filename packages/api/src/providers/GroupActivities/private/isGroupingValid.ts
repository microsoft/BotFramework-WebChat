import { type WebChatActivity } from 'botframework-webchat-core';

export default function isGroupingValid(
  source: readonly WebChatActivity[],
  bins: readonly (readonly WebChatActivity[])[]
): boolean {
  const set = new Set(source);

  if (source.length !== set.size) {
    console.warn('botframework-webchat: Cannot validate activity grouping because some activities are duplicated');

    return false;
  }

  for (const bin of bins) {
    for (const activityInBin of bin) {
      if (!set.has(activityInBin)) {
        console.warn(
          'botframework-webchat: All binned items must be originate from the source list, check groupingActivityMiddleware to make sure it bin from the source list',
          {
            activityInBin
          }
        );

        return false;
      }

      set.delete(activityInBin);
    }
  }

  if (set.size) {
    console.warn(
      'botframework-webchat: Not every activity is binned, check groupingActivityMiddleware to make sure it is binning every activity passed'
    );

    return false;
  }

  return true;
}
