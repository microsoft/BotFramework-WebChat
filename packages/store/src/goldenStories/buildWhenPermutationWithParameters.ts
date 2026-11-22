function buildWhenPermutationWithParameters<TParameter, TPrecondition, TOutcome>(
  permutations: [string, TParameter][],
  executor: (parameter: TParameter, precondition: TPrecondition) => TOutcome
): [string, (precondition: TPrecondition) => TOutcome][] {
  return permutations.map(([message, parameter]) => [message, executor.bind(undefined, parameter)]);
}

export default buildWhenPermutationWithParameters;
