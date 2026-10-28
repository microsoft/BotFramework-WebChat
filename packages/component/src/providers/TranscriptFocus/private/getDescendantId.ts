/** Returns the ID of the activity or group for `aria-activedescendant`, or `undefined` without a key. */
export default function getDescendantId(
  prefix: string,
  type: 'activity' | 'group',
  key?: string | undefined
): string | undefined {
  return key && `webchat__transcript-focus-${prefix}__${type}-${key}`;
}
