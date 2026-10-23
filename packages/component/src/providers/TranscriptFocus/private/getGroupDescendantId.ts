export default function getGroupDescendantId(prefix: string, groupKey?: string | undefined): string | undefined {
  return groupKey && `webchat__transcript-focus-${prefix}__group-${groupKey}`;
}
