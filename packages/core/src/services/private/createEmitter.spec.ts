import createEmitter from './createEmitter';

describe('createEmitter()', () => {
  test('calls the listeners in the order they subscribed, with the arguments', () => {
    const emitter = createEmitter<[number, string]>();
    const calls: string[] = [];

    emitter.subscribe((count, text) => calls.push(`a ${count} ${text}`));
    emitter.subscribe((count, text) => calls.push(`b ${count} ${text}`));
    emitter.emit(1, 'x');

    expect(calls).toEqual(['a 1 x', 'b 1 x']);
  });

  test('unsubscribe removes the listener; a listener added during an emit waits for the next one', () => {
    const emitter = createEmitter<[]>();
    const calls: string[] = [];
    const unsubscribe = emitter.subscribe(() => {
      calls.push('a');
      emitter.subscribe(() => calls.push('late'));
    });

    emitter.emit();
    unsubscribe();
    emitter.emit();

    expect(calls).toEqual(['a', 'late']);
  });

  test('a listener that throws stops the others, and the error is thrown', () => {
    const emitter = createEmitter<[]>();
    const after = jest.fn();

    emitter.subscribe(() => {
      throw new Error('artificial');
    });
    emitter.subscribe(after);

    expect(() => emitter.emit()).toThrow('artificial');
    expect(after).not.toHaveBeenCalled();
  });
});
