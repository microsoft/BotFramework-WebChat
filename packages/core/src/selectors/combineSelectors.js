export default function combineSelectors(selectors) {
  if (Array.isArray(selectors)) {
    return state => selectors.reduce((combinedState, selector) => [...combinedState, selector(state)], []);
  }

  return state =>
    Object.keys(selectors).reduce((combinedState, key) => ({ ...combinedState, [key]: selectors[key](state) }), {});
}
