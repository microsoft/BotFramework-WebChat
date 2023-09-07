import { fromMarkdown } from 'mdast-util-from-markdown';
import { type Definition, type Node } from 'mdast';

function isDefinition(node: Node): node is Definition {
  return node.type === 'definition';
}

export default function* iterateLinkDefinitions(markdown: string): Generator<Definition, void, void> {
  for (const topLevelNode of fromMarkdown(markdown).children) {
    if (isDefinition(topLevelNode)) {
      yield topLevelNode;
    }
  }
}
