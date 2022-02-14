import isForbiddenPropertyName from '../utils/isForbiddenPropertyName';

export default function combineSelectors<
  TState extends { [key: string]: unknown },
  TResult extends { [key: string]: unknown }
>(selectors: { [P in keyof TResult]: (state: TState) => TResult[P] }): (state: TState) => {
  [P in keyof TResult]?: TResult[P];
} {
  if (Array.isArray(selectors)) {
    return state => selectors.reduce((combinedState, selector) => [...combinedState, selector(state)], []);
  }

  return state =>
    Object.keys(selectors).reduce(
      (combinedState, key) =>
        // Mitigated through denylisting.
        // eslint-disable-next-line security/detect-object-injection
        isForbiddenPropertyName(key) ? combinedState : { ...combinedState, [key]: selectors[key](state) },
      {} as TResult
    );
}
