import isForbiddenPropertyName from '../utils/isForbiddenPropertyName';

export default function combineSelectors(selectors) {
  if (Array.isArray(selectors)) {
    return state => selectors.reduce((combinedState, selector) => [...combinedState, selector(state)], []);
  }

  return state =>
    Object.keys(selectors).reduce(
      (combinedState, key) =>
        // Mitigated through denylisting.
        // eslint-disable-next-line security/detect-object-injection
        isForbiddenPropertyName(key) ? combinedState : { ...combinedState, [key]: selectors[key](state) },
      {}
    );
}
