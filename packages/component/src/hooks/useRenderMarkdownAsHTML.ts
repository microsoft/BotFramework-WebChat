import { fromMarkdown } from 'mdast-util-from-markdown';
import { hooks, StrictStyleOptions } from 'botframework-webchat-api';
import { useMemo } from 'react';

import useWebChatUIContext from './internal/useWebChatUIContext';

import type { Definition, LinkReference, Node, Parent } from 'mdast';

const { useLocalizer, useStyleOptions } = hooks;

// TODO: Dedupe.
type LinkDescriptor = {
  /**
   * True, if the link is a pure identifier pointing to a link definition, such as [1] or [1][1].
   * In contrast, false, if it is [1](https://.../).
   */
  isPureIdentifier: boolean;
  href: string;
  type: 'citation' | 'link' | 'unknown';
};

function* walk(tree: Parent): Generator<Node> {
  for (const child of tree.children) {
    yield child;

    const { type } = child;

    if (
      type === 'blockquote' ||
      type === 'delete' ||
      type === 'emphasis' ||
      type === 'footnoteDefinition' ||
      type === 'heading' ||
      type === 'link' ||
      type === 'linkReference' ||
      type === 'list' ||
      type === 'listItem' ||
      type === 'paragraph' ||
      type === 'strong' ||
      type === 'table' ||
      type === 'tableCell' ||
      type === 'tableRow'
    ) {
      yield* walk(child);
    }
  }
}

function getURLProtocol(url: string): string | undefined {
  try {
    return new URL(url).protocol;
  } catch (error) {
    // Return undefined.
  }
}

function isDefinition(node: Node): node is Definition {
  return node.type === 'definition';
}

function isLinkReference(node: Node): node is LinkReference {
  return node.type === 'linkReference';
}

export default function useRenderMarkdownAsHTML(): (
  markdown: string,
  styleOptions?: StrictStyleOptions,
  options?: { externalLinkAlt: string; linkDescriptors?: Array<LinkDescriptor> }
) => string {
  const { renderMarkdown } = useWebChatUIContext();
  const [styleOptions] = useStyleOptions();
  const localize = useLocalizer();

  const externalLinkAlt = localize('MARKDOWN_EXTERNAL_LINK_ALT');

  return useMemo(() => {
    if (!renderMarkdown) {
      return;
    }

    return markdown => {
      const tree = fromMarkdown(markdown);
      const definitions: Map<string, Definition> = new Map();
      const linkDescriptors: Array<LinkDescriptor> = [];

      for (const node of walk(tree)) {
        isDefinition(node) && definitions.set(node.identifier, node);
      }

      for (const node of walk(tree)) {
        if (isLinkReference(node)) {
          const definition = definitions.get(node.identifier);

          if (definition) {
            const { url } = definition;

            const protocol = getURLProtocol(url);

            linkDescriptors.push({
              href: url,
              isPureIdentifier: !node.label || node.identifier === node.label,
              type:
                protocol === 'cite:' ? 'citation' : protocol === 'http:' || protocol === 'https:' ? 'link' : 'unknown'
            });
          }
        }
      }

      return renderMarkdown(markdown, styleOptions, { externalLinkAlt, linkDescriptors });
    };
  }, [externalLinkAlt, renderMarkdown, styleOptions]);
}
