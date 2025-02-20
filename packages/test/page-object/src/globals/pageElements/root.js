let currentRoot = document;

export default function root(root) {
  if (typeof root !== 'undefined') {
    currentRoot = root;
  }

  return currentRoot;
}
