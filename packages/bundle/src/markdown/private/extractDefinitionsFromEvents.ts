import { normalizeIdentifier } from 'micromark-util-normalize-identifier';
import type { Event } from 'micromark-util-types';

type MarkdownLinkDefinition = Readonly<{
  identifier: string;
  label?: string;
  title?: string;
  url: string;
}>;

export default function extractDefinitionsFromEvents(events: readonly Event[]): readonly MarkdownLinkDefinition[] {
  const definitions: MarkdownLinkDefinition[] = [];

  let inDefinition = false;
  let label = '';
  let title = '';
  let url = '';

  for (const [action, token, context] of events) {
    if (action === 'enter' && token.type === 'definition') {
      inDefinition = true;
      label = '';
      title = '';
      url = '';

      continue;
    }

    if (!inDefinition || action !== 'exit') {
      continue;
    }

    switch (token.type) {
      case 'definitionLabelString':
        label = context.sliceSerialize(token);
        break;

      case 'definitionDestinationString':
        url = context.sliceSerialize(token);
        break;

      case 'definitionTitleString':
        title = context.sliceSerialize(token);
        break;

      case 'definition':
        definitions.push(
          Object.freeze({
            identifier: normalizeIdentifier(label),
            label,
            title,
            url
          })
        );

        inDefinition = false;
        break;

      default:
        break;
    }
  }

  return Object.freeze(definitions);
}

export { type MarkdownLinkDefinition };
