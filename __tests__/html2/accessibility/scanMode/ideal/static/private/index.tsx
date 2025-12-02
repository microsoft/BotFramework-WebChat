// @ts-ignore
import cx from 'classnames';
// @ts-ignore
import { useRefFrom } from 'https://esm.sh/use-ref-from';
// @ts-ignore
import { useStateWithRef } from 'https://esm.sh/use-state-with-ref';
import {
  Dispatch,
  forwardRef,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react';
// @ts-ignore
import { createRoot } from 'react-dom/client';

// Notes:
// 1. We cannot use `inert` because it would block mouse clicks as well as TAB.

const FOCUSABLE_SELECTOR_QUERY = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function isElementFocusable(element) {
  return element.matches(FOCUSABLE_SELECTOR_QUERY);
}

function FocusRedirector({ redirectRef }) {
  const handleFocus = useCallback(() => redirectRef.current?.focus(), [redirectRef]);

  return <div className="focus-redirector" onFocus={handleFocus} tabIndex={0} />;
}

// TODO: Use our own implementation of <FocusTrap>, we have better UX:
//       - Save last focus
//       - When an element become non-focusable
//       However, this implementation is better at:
//       - Handle "inert" attribute
//       - Handle invisible element (element without `offsetParent`)
function FocusTrap({ children, onEscapeKeyDown }) {
  const onEscapeKeyDownRef = useRefFrom(onEscapeKeyDown);
  const rootRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    event => {
      const container = rootRef.current;

      if (!container) {
        return;
      }

      if (event.key === 'Tab') {
        const focusables = Array.from<HTMLElement>(container.querySelectorAll(FOCUSABLE_SELECTOR_QUERY)).filter(
          element => !element.closest('[inert]') && element.offsetParent
        );

        if (!focusables.length) {
          return;
        }

        const firstElement = focusables[0];
        const lastElement = focusables.at(-1);

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          event.stopPropagation();

          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          event.stopPropagation();

          firstElement.focus();
        }
      } else if (event.key === 'Escape') {
        event.stopPropagation();

        onEscapeKeyDownRef.current?.();
      }
    },
    [onEscapeKeyDownRef]
  );

  return (
    <div className="focus-trap" onKeyDown={handleKeyDown} ref={rootRef}>
      {children}
    </div>
  );
}

function ChatMessage({ abstract, activeMode, children, index, onActive, onLeave, ref }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentId = useMemo(() => crypto.randomUUID(), []);
  const headerId = useMemo(() => crypto.randomUUID(), []);
  const indexRef = useRefFrom(index);
  const onActiveRef = useRefFrom(onActive);
  const onLeaveRef = useRefFrom(onLeave);

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        bodyRef.current?.setAttribute('tabindex', '-1');
        bodyRef.current?.focus();
      }
    }),
    [bodyRef]
  );

  const handleContentBlur = useCallback(() => {
    bodyRef.current?.removeAttribute('role');
    bodyRef.current?.removeAttribute('tabindex');
  }, [bodyRef]);

  const handleContentFocus = useCallback(() => {
    bodyRef.current?.setAttribute('role', 'document');
    bodyRef.current?.setAttribute('tabindex', '-1'); // TODO: Do we still need this?

    onActiveRef.current?.(indexRef.current, 'content');
  }, [bodyRef, onActiveRef]);

  const handleKeyDown = useCallback(
    event => {
      if (event.key === 'Escape') {
        event.stopPropagation();

        onLeaveRef.current?.();
      } else if (event.key === 'Tab' && event.target === bodyRef.current) {
        // Special case: regardless if the content is interactive or not, trap the TAB key.

        // TODO: Can we make this simpler? Says, if we merge <div data-testid="chat message body"> with <FocusTrap>, will it makes this simpler?
        const focusables = Array.from<HTMLElement>(bodyRef.current?.querySelectorAll(FOCUSABLE_SELECTOR_QUERY)).filter(
          element => !element.closest('[inert]') && element.offsetParent
        );

        if (!focusables.length) {
          event.preventDefault();
        }
      }
    },
    [onLeaveRef]
  );

  const handleHeaderClick = useCallback(() => {
    bodyRef.current?.focus();
  }, [bodyRef]);

  const handleRootClick = useCallback(
    event => {
      onActiveRef.current?.(indexRef.current, isElementFocusable(event.target) ? 'content' : 'container');
    },
    [indexRef, onActiveRef]
  );

  const rootRef = useRef<HTMLDivElement>();
  const [isFocused, setIsFocused, isFocusedRef] = useStateWithRef(false);

  useEffect(() => {
    if (document.activeElement && rootRef.current?.contains(document.activeElement)) {
      setIsFocused(true);
    } else {
      setIsFocused(false);
    }
  }, [isFocusedRef, rootRef, setIsFocused]);

  return (
    <article // Required: children of role="feed" must be role="article".
      aria-labelledby={headerId} // Required: we just want screen reader to narrate header. Without this, it will narrate the whole content.
      className={cx('chat-message', { 'chat-message__is-active': activeMode })}
      data-testid="chat message"
      id={`chat-message__index--${index}`}
      onClick={handleRootClick}
      ref={rootRef}
    >
      <h4
        className="chat-message__header"
        id={headerId}
        // Narrator UX: in scan mode, when user press ENTER, we will get onClick and we can use it to focus into the message.
        //              However, this item should be hidden as we want to prevent mouse clicks.
        onClick={handleHeaderClick}
      >
        {abstract}
      </h4>
      <div
        aria-labelledby={contentId} // Narrator quirks: without aria-labelledby, after pressing ENTER and focus on this element, Narrator will say nothing.
        className="chat-message__body"
        data-testid="chat message body"
        onBlur={handleContentBlur}
        onFocus={handleContentFocus}
        onKeyDown={handleKeyDown}
        ref={bodyRef}
        role={isFocused ? 'document' : undefined} // Required: as instructed by C+AI accessibility team: after pressing ENTER, add role="document" and focus on the element, screen reader should change to scan/browse mode.
        tabIndex={isFocused ? -1 : undefined} // Required: as instructed by C+AI accessibility team: after pressing ENTER, add role="document" and focus on the element, screen reader should change to scan/browse mode.
      >
        <div className="chat-message__content" id={contentId}>
          <FocusTrap onEscapeKeyDown={onLeave}>{children}</FocusTrap>
        </div>
      </div>
    </article>
  );
}

function ChatHistory({ onLeave }) {
  const [activeMessageIndex, setActiveMessageIndexRaw, activeMessageIndexRef] = useStateWithRef<number>(Infinity);
  const [_isMessageFocused, setIsMessageFocused, isMessageFocusedRef] = useStateWithRef(false);
  const bodyRef = useRef<HTMLDivElement>();
  const message0Ref = useRef<HTMLElement>();
  const message1Ref = useRef<HTMLElement>();
  const message2Ref = useRef<HTMLElement>();
  const messagesRef = useMemo<MutableRefObject<HTMLElement>[]>(
    () => [message0Ref, message1Ref, message2Ref],
    [message0Ref, message1Ref, message2Ref]
  );
  const onLeaveRef = useRefFrom(onLeave);
  const rootRef = useRef<HTMLDivElement>();

  const setActiveMessageIndex = useCallback<Dispatch<SetStateAction<number>>>(
    nextActiveMessageIndex => {
      setActiveMessageIndexRaw(activeMessageIndex => {
        if (typeof nextActiveMessageIndex === 'function') {
          nextActiveMessageIndex = nextActiveMessageIndex(activeMessageIndex);
        }

        return nextActiveMessageIndex >= messagesRef.length - 1 ? Infinity : nextActiveMessageIndex;
      });
    },
    [setActiveMessageIndexRaw]
  );

  const handleAddressFormSubmit = useCallback(event => event.preventDefault(), []);

  const handleKeyDown = useCallback(
    event => {
      if (document.activeElement === rootRef.current) {
        if (event.key === 'ArrowUp') {
          event.stopPropagation();

          setActiveMessageIndex(index => Math.max(0, (index === Infinity ? messagesRef.length - 1 : index) - 1));
        } else if (event.key === 'ArrowDown') {
          event.stopPropagation();

          setActiveMessageIndex(index => Math.min(messagesRef.length - 1, index + 1));
        } else if (event.key === 'Enter') {
          event.stopPropagation();

          const { current: activeMessageIndex } = activeMessageIndexRef;

          messagesRef.at(activeMessageIndex === Infinity ? -1 : activeMessageIndex).current?.focus();
        } else if (event.key === 'Escape') {
          // We like this, when pressing ESCAPE key on chat history, send the focus to send box.
          onLeaveRef.current?.();
        } else if (event.key === 'Tab') {
          // When tabbing out of chat history, skip all message bodies.
          bodyRef.current?.setAttribute('inert', 'inert');

          requestAnimationFrame(() => bodyRef.current?.removeAttribute('inert'));
        }
      }
    },
    [activeMessageIndexRef, isMessageFocusedRef, messagesRef, onLeaveRef, setActiveMessageIndex, setIsMessageFocused]
  );

  const handleMessageActive = useCallback(
    (index, where) => {
      setActiveMessageIndex(index);

      where !== 'content' && rootRef.current?.focus();
    },
    [rootRef, setActiveMessageIndex, setIsMessageFocused]
  );

  const handleMessageLeave = useCallback(() => {
    rootRef.current?.focus();
  }, [rootRef, setIsMessageFocused]);

  return (
    <div
      aria-activedescendant={`chat-message__index--${activeMessageIndex === Infinity ? messagesRef.length - 1 : activeMessageIndex}`} // Matter of taste: we are using active descendant to control focus, instead of roving tab index.
      className="chat-history"
      data-testid="chat history"
      onKeyDown={handleKeyDown}
      ref={rootRef}
      role="group" // Required: aria-activedescendant is only available for role="group".
      tabIndex={0} // Required: container of the active descendant must be focusable.
    >
      <section
        className="chat-history__body"
        ref={bodyRef}
        role="feed" // Required: we are using role="feed/article" to represent the chat thread.
      >
        <ChatMessage
          abstract="Bot said: Hello, World!" // Matter of taste on how to abstract the text: this is for screen reader user pressing H key to quickly jump between messages.
          activeMode={activeMessageIndex === 0 ? 'active' : undefined}
          index={0}
          onActive={handleMessageActive}
          onLeave={activeMessageIndex === 0 ? handleMessageLeave : undefined}
          ref={message0Ref}
        >
          <p>Hello, World!</p>
          <p>
            Click <a href="https://bing.com/">this link</a> for more details.
          </p>
        </ChatMessage>
        <ChatMessage
          abstract="You said: Aloha!"
          activeMode={activeMessageIndex === 1 ? 'active' : undefined}
          index={1}
          onActive={handleMessageActive}
          onLeave={activeMessageIndex === 1 ? handleMessageLeave : undefined}
          ref={message1Ref}
        >
          <p>Aloha!</p>
        </ChatMessage>
        <ChatMessage
          abstract="Bot said: Where should we ship it to?"
          activeMode={activeMessageIndex === Infinity ? 'active' : undefined}
          index={2}
          onActive={handleMessageActive}
          onLeave={activeMessageIndex === Infinity ? handleMessageLeave : undefined}
          ref={message2Ref}
        >
          <form data-testid="address form" onSubmit={handleAddressFormSubmit}>
            <p>Where should we ship it to?</p>
            <div>
              <label>
                Street address
                <div>
                  <input data-testid="street address textbox" placeholder="Street address" type="text" />
                </div>
              </label>
            </div>
            <div>
              <label>
                City
                <div>
                  <input placeholder="City" type="text" />
                </div>
              </label>
            </div>
            <div>
              <label>
                State
                <div>
                  <select placeholder="State">
                    <option>California</option>
                    <option>Oregon</option>
                    <option>Washington</option>
                  </select>
                </div>
              </label>
            </div>
            <div>
              <button data-testid="address form submit button" type="submit">
                Submit
              </button>
            </div>
          </form>
        </ChatMessage>
        <FocusRedirector redirectRef={rootRef} />
      </section>
    </div>
  );
}

const SendBox = forwardRef<HTMLTextAreaElement>(function SendBox(_, ref) {
  const handleSubmit = useCallback(event => {
    event.preventDefault();
  }, []);

  return (
    <form className="send-box" data-testid="send box" onSubmit={handleSubmit}>
      <textarea
        autoFocus={true}
        className="send-box__text-box"
        data-testid="send box text box"
        placeholder="Type a message"
        ref={ref}
      />
    </form>
  );
});

function ChatApp() {
  const sendBoxRef = useRef<HTMLTextAreaElement>();

  const handleChatHistoryLeave = useCallback(() => sendBoxRef.current?.focus(), [sendBoxRef]);

  return (
    <div
      className="chat-app"
      data-testid="chat app"
      role="application" // Required: role="document" will only work when its container has role="application".
    >
      <ChatHistory onLeave={handleChatHistoryLeave} />
      <SendBox ref={sendBoxRef} />
    </div>
  );
}

const mainElement = document.querySelector('main');

mainElement && createRoot(mainElement).render(<ChatApp />);
