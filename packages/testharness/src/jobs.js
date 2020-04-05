import createDeferred from 'p-defer-es5';

import uniqueId from './utils/uniqueId';

const actions = [];

function post(action) {
  const deferred = createDeferred();
  const id = uniqueId();

  actions.push({ ...action, deferred, id });

  return deferred.promise;
}

function acquire() {
  const [firstAction] = actions;

  if (firstAction) {
    const { id, payload, type } = firstAction;

    return { id, payload, type };
  }
}

function resolve(id, result) {
  const [firstAction] = actions;

  if (!firstAction || id !== firstAction.id) {
    throw new Error(`No jobs found with ID "${id}" to resolve. Got ${actions.map(({ id }) => id).join(', ')}`);
  }

  firstAction.deferred.resolve(result);
  actions.shift();
}

function reject(id, error) {
  const [firstAction] = actions;

  if (id !== firstAction.id) {
    throw new Error(`No jobs found with ID "${id}" to reject. Got ${actions.map(({ id }) => id).join(', ')}`);
  }

  firstAction.deferred.reject(error);
  actions.shift();
}

export { acquire, post, resolve, reject };
