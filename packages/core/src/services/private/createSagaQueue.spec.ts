import createSagaQueue from './createSagaQueue';

describe('createSagaQueue', () => {
  test('later() inside a batch runs after it, in order, also the tasks it queues', () => {
    const { batch, later } = createSagaQueue();
    const calls: string[] = [];

    batch(() => {
      later(() => {
        calls.push('a');
        later(() => calls.push('c'));
      });
      later(() => calls.push('b'));
      calls.push('batch');
    });

    later(() => calls.push('now'));

    expect(calls).toEqual(['batch', 'a', 'b', 'c', 'now']);
  });

  test('a reaction that takes an action waits again at the end of the list', () => {
    const { handleAction, onAction } = createSagaQueue();
    const calls: string[] = [];

    onAction(
      ({ type }) => type === 'SET_DICTATE_INTERIMS' || type === 'SET_SEND_BOX',
      () => calls.push('first')
    );
    onAction(
      ({ type }) => type === 'SET_SEND_BOX',
      () => calls.push('second')
    );

    handleAction({ text: 'a', type: 'SET_SEND_BOX' });
    // Only the first one takes it: it moves after the second one.
    handleAction({ type: 'SET_DICTATE_INTERIMS' });
    handleAction({ text: 'b', type: 'SET_SEND_BOX' });

    expect(calls).toEqual(['first', 'second', 'first', 'second', 'first']);
  });

  test('a reaction stopped while handling an action is not called', () => {
    const { handleAction, onAction } = createSagaQueue();
    const calls: string[] = [];
    // eslint-disable-next-line prefer-const
    let stopSecond: () => void;

    onAction(
      () => true,
      () => {
        calls.push('first');
        stopSecond();
      }
    );
    stopSecond = onAction(
      () => true,
      () => calls.push('second')
    );

    handleAction({ type: 'SET_DICTATE_INTERIMS' });
    handleAction({ type: 'SET_DICTATE_INTERIMS' });

    expect(calls).toEqual(['first', 'first']);
  });
});
