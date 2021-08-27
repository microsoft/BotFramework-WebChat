export default function findAncestor(
  node: HTMLElement,
  predicate: (ancestor: HTMLElement) => boolean
): HTMLElement | undefined {
  let ancestor = node;

  while ((ancestor = ancestor.parentElement)) {
    if (predicate(ancestor)) {
      return ancestor;
    }
  }
}
