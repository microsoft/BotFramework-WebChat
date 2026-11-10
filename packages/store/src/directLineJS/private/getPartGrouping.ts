import type { DirectLineActivity } from './DirectLineActivity.ts';
import getSelfMessage from './getSelfMessage.ts';

type PartGrouping = {
  readonly groupingId: string;
  readonly position: number | undefined;
};

/**
 * Gets the part grouping of the activity of the specified type (e.g. `HowTo`), or `undefined` if the activity is not
 * part of a grouping of the type.
 *
 * Grouping is set in `isPartOf` of the self message entity, see `getPartGroupingMetadataMap()` of
 * `botframework-webchat-core`.
 */
function getPartGrouping(activity: DirectLineActivity, type: string): PartGrouping | undefined {
  const message = getSelfMessage(activity.entities);

  let partGrouping: PartGrouping | undefined;

  if (message) {
    const [firstPosition] = message.position;

    for (const part of message.isPartOf) {
      // Last one wins, same as `getPartGroupingMetadataMap()`.
      part['@id'] &&
        part['@type'].includes(type) &&
        (partGrouping = Object.freeze({
          groupingId: part['@id'],
          // We do not support non-number position.
          position: typeof firstPosition === 'number' ? firstPosition : undefined
        }));
    }
  }

  return partGrouping;
}

export default getPartGrouping;
export { type PartGrouping };
