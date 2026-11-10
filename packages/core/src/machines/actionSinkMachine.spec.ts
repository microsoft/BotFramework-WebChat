/**
 * @jest-environment @happy-dom/jest-environment
 */
// The action sinks (the transport of `<ReduxSuggestedActionsMirror>`): no parity script registers one. Pinned on the
// sagas, which the machine replaced.
import registerActionSink from '../actions/registerActionSink';
import setDictateState from '../actions/setDictateState';
import unregisterActionSink from '../actions/unregisterActionSink';
import { WILL_START } from '../constants/DictateState';
import createStore from '../createStore';

test('each sink gets every action after it, put ones too, until unregistered', () => {
  const calls: string[] = [];
  const store = createStore();
  const createSink = (name: string) => (action: { type: string }) => calls.push(`${name}: ${action.type}`);
  const first = createSink('first');
  const second = createSink('second');

  store.dispatch({ type: 'BEFORE' });
  store.dispatch(registerActionSink(first));
  store.dispatch({ type: 'A' });
  store.dispatch(registerActionSink(second));
  // A machine puts START_DICTATE after it, before the next action.
  store.dispatch(setDictateState(WILL_START));
  // Another sink: unregisters nothing, and both get it.
  store.dispatch(unregisterActionSink(createSink('other')));
  store.dispatch(unregisterActionSink(first));
  store.dispatch({ type: 'C' });
  store.dispatch(unregisterActionSink(second));
  store.dispatch({ type: 'AFTER' });

  expect(calls).toEqual([
    'first: A',
    // The sinks wait as takers: one that took an action waits again at the end, after the other sink.
    'first: WEB_CHAT_INTERNAL/REGISTER_ACTION_SINK',
    'second: WEB_CHAT/SET_DICTATE_STATE',
    'first: WEB_CHAT/SET_DICTATE_STATE',
    'second: WEB_CHAT/START_DICTATE',
    'first: WEB_CHAT/START_DICTATE',
    'second: WEB_CHAT_INTERNAL/UNREGISTER_ACTION_SINK',
    'first: WEB_CHAT_INTERNAL/UNREGISTER_ACTION_SINK',
    // The first sink is unregistered by this one, which it does not get.
    'second: WEB_CHAT_INTERNAL/UNREGISTER_ACTION_SINK',
    'second: C'
  ]);
});
