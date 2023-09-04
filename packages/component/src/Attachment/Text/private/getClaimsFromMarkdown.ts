import { fromMarkdown } from 'mdast-util-from-markdown';

import onErrorResumeNext from './onErrorResumeNext';
import stripMarkdown from './stripMarkdown';

// import type { Reference } from '../types/Reference';
import type { Claim as SchemaOrgClaim } from '../../../types/external/SchemaOrg/Claim';
import type { Definition, LinkReference, Node, Parent, Root, Text } from 'mdast';

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

function isDefinition(node: Node): node is Definition {
  return node.type === 'definition';
}

function isLinkReference(node: Node): node is LinkReference {
  return node.type === 'linkReference';
}

function getDefinition(root: Root, identifier: string): Definition | undefined {
  return root.children.find<Definition>(
    (topLevelNode: Node): topLevelNode is Definition =>
      isDefinition(topLevelNode) && topLevelNode.identifier === identifier
  );
}

export default function* getClaimsFromMarkdown(
  text: string,
  claimsWithText: Map<string, SchemaOrgClaim & { text: string }>
): Generator<SchemaOrgClaim> {
  const tree = fromMarkdown(text);

  for (const node of walk(tree)) {
    if (isLinkReference(node)) {
      const definition = getDefinition(tree, node.identifier);

      if (!definition) {
        continue;
      }

      const { identifier: id, title, url } = definition;
      const getTextReferenced = () =>
        node.children.find<Text>((node): node is Text => node.type === 'text')?.value || '';

      const claim = claimsWithText.get(url);

      if (claim) {
        yield {
          alternateName: claim.alternateName || getTextReferenced(),
          name:
            claim.name ||
            stripMarkdown(claim.text)
              .replace(/\r\n/gu, ' ')
              .replace(/\s{2,}/gu, ' '),
          ...claim
        };
      } else {
        yield {
          '@context': 'https://schema.org/',
          '@id': id,
          '@type': 'Claim',
          alternateName: getTextReferenced(),
          name: title || onErrorResumeNext(() => new URL(definition.url).host) || definition.url,
          type: 'https://schema.org/Claim',
          url: definition.url
        };
      }
    }
  }
}
