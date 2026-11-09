import createVoiceService from './createVoiceService';

describe('createVoiceService', () => {
  test('one operation notifies once, also when it changes two values', () => {
    const notify = jest.fn((callListeners: () => void) => callListeners());
    const voice = createVoiceService({ notify });
    const listener = jest.fn();

    voice.startVoice();
    voice.setMuted(true);

    voice.voiceState.subscribe(listener);

    // Muted and listening: stopping unmutes and goes idle, in one change.
    voice.stopVoice();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledTimes(3);
    expect([voice.microphoneMuted.get(), voice.voiceState.get()]).toEqual([false, 'idle']);
  });

  test('the sources read their part of the slice', () => {
    const voice = createVoiceService();
    const handler = { queueAudio: jest.fn(), stopAllAudio: jest.fn() };
    const before = voice.voiceHandlers.get();
    const unregister = voice.registerVoiceHandler('h1', handler);

    expect(voice.voiceHandlers.get()).not.toBe(before);
    expect(Array.from(voice.port.getVoiceHandlers())).toEqual([handler]);

    unregister();

    expect(Array.from(voice.voiceHandlers.get().keys())).toEqual([]);
    expect(voice.port.getVoiceState()).toBe('idle');

    voice.port.setVoiceState('processing');

    expect(voice.voiceState.get()).toBe('processing');
  });
});
