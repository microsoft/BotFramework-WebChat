/// <reference types="jest" />

import createOnEventShim from './createOnEventShim';

describe('A shimmed event target', () => {
  class MyEventTarget extends EventTarget {
    #shim = createOnEventShim<'message'>(this);

    get onmessage() {
      return this.#shim.get('message');
    }

    set onmessage(listener: EventListener) {
      this.#shim.set('message', listener);
    }
  }

  describe('with an "onmessage" handler', () => {
    let eventTarget: MyEventTarget;
    let messageEventListener: jest.Mock<void, []>;

    beforeEach(() => {
      eventTarget = new MyEventTarget();
      messageEventListener = jest.fn();
      eventTarget.onmessage = messageEventListener;
    });

    test('"onmessage" getter should return the event listener', () =>
      expect(eventTarget.onmessage).toBe(messageEventListener));

    describe('when a "message" event is dispatched', () => {
      let messageEvent: Event;

      beforeEach(() => {
        messageEvent = new Event('message');
        eventTarget.dispatchEvent(messageEvent);
      });

      test('"onmessage" handler should be called once', () => expect(messageEventListener).toHaveBeenCalledTimes(1));
      test('"onmessage" handler should be called with the event', () =>
        expect(messageEventListener).toHaveBeenNthCalledWith(1, messageEvent));
    });

    describe('replaced with another "onmessage" handler', () => {
      let anotherMessageEventListener: jest.Mock<void, []>;

      beforeEach(() => {
        anotherMessageEventListener = jest.fn();
        eventTarget.onmessage = anotherMessageEventListener;
      });

      test('"onmessage" getter should return the updated event listener', () =>
        expect(eventTarget.onmessage).toBe(anotherMessageEventListener));

      describe('when a "message" event is dispatched', () => {
        let messageEvent: Event;

        beforeEach(() => {
          messageEvent = new Event('message');
          eventTarget.dispatchEvent(messageEvent);
        });

        test('the previous "onmessage" handler should not be called', () =>
          expect(messageEventListener).toHaveBeenCalledTimes(0));
        test('the updated "onmessage" handler should be called once', () =>
          expect(anotherMessageEventListener).toHaveBeenCalledTimes(1));
        test('the updated "onmessage" handler should be called with the event', () =>
          expect(anotherMessageEventListener).toHaveBeenNthCalledWith(1, messageEvent));
      });
    });

    describe('when the handler is removed', () => {
      beforeEach(() => {
        eventTarget.onmessage = null;
      });

      test('"onmessage" getter should return falsy', () => expect(eventTarget.onmessage).toBeFalsy());

      describe('when a "message" event is dispatched', () => {
        let messageEvent: Event;

        beforeEach(() => {
          messageEvent = new Event('message');
          eventTarget.dispatchEvent(messageEvent);
        });

        test('the removed "onmessage" handler should not be called', () =>
          expect(messageEventListener).toHaveBeenCalledTimes(0));
      });
    });
  });
});
