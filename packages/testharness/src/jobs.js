import createDeferred from 'p-defer';
import uniqueId from './utils/uniqueId';

const actions = [];
let nextPushDeferred;

function post(action) {
  const deferred = createDeferred();

  action = { ...action, deferred, id: uniqueId() };

  actions.push(action);
  nextPushDeferred && nextPushDeferred.resolve();

  return deferred.promise;
}

function acquire() {
  const [first] = actions.filter(action => !action.busy);

  if (first) {
    first.busy = true;

    return first;
  }
}

function resolve(id, result) {
  const index = actions.findIndex(action => action.id === id);
  const action = actions[index];

  actions.splice(index, 1);
  action.deferred.resolve(result);
}

function reject(id, error) {
  const index = actions.findIndex(action => action.id === id);
  const action = actions[index];

  actions.splice(index, 1);
  action.deferred.reject(error);
}

export { acquire, post, resolve, reject };
