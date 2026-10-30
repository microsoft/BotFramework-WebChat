import type { GraphNode } from '../types';

/** The nodes changed by one transaction, linked to the journal before it (structural sharing between states). */
type GraphJournal = {
  readonly changedNodes: readonly GraphNode[];
  readonly previous: GraphJournal | undefined;
};

function appendToJournal(journal: GraphJournal | undefined, changedNodes: readonly GraphNode[]): GraphJournal {
  return Object.freeze({ changedNodes, previous: journal });
}

/** The latest version of every node in the journal, e.g. to rebuild the graph a state saw. */
function getJournalNodes(journal: GraphJournal | undefined): readonly GraphNode[] {
  const nodes = new Map<string, GraphNode>();

  for (let link = journal; link; link = link.previous) {
    for (let index = link.changedNodes.length - 1; index >= 0; index--) {
      // eslint-disable-next-line security/detect-object-injection
      const node = link.changedNodes[index]!;

      nodes.has(node['@id']) || nodes.set(node['@id'], node);
    }
  }

  return Object.freeze(Array.from(nodes.values()));
}

export { appendToJournal, getJournalNodes, type GraphJournal };
