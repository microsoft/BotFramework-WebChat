// @ts-ignore
import cx from 'classnames';
// @ts-ignore
import { useRefFrom } from 'https://esm.sh/use-ref-from';
// @ts-ignore
import {
  type Dispatch,
  forwardRef,
  type KeyboardEventHandler,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
// @ts-ignore
import { createRoot } from 'react-dom/client';

// Notes:
// 1. We cannot use `inert` because it would block mouse clicks as well as TAB.
//    - However, we can use it for temporarily (split second) things.
// 2. Opinion: `stopPropagation` vs. `preventDefault`.
//    The content may not know they are not inside a container, thus, they may not use `stopPropagation` to prevent ancestor from grabbing the event.
//    Instead, content may continue to use `preventDefault` to stop ancestors from knowing the event.
//    Thus, we should use `defaultPrevented` to check if we should handle the event from the content or not.

type ChatMessageAPI = { readonly focusContent: () => void };
type Message = {
  readonly abstract: string;
  readonly children: ReactNode | undefined;
  readonly id: string;
};

const CHAT_MESSAGES: readonly Message[] = Object.freeze([
  {
    abstract: 'Bot said: Hello, World!',
    children: (
      <>
        <p>Hello, World!</p>
        <p>
          Click <a href="https://bing.com/">this link</a> for more details.
        </p>
      </>
    ),
    id: 'a-00001'
  },
  {
    abstract: 'You said: Aloha!',
    children: <p>Aloha!</p>,
    id: 'a-00002'
  },
  {
    abstract: 'Bot said: Where should we ship it to?',
    children: (
      <form data-testid="address form" onSubmit={event => event.preventDefault()}>
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
    ),
    id: 'a-00003'
  }
]);

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

function ChatMessage({ abstract, activeMode, children, id, messageId, onActive, onLeave, ref }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentId = useMemo(() => crypto.randomUUID(), []);
  const headerId = useMemo(() => crypto.randomUUID(), []);
  const messageIdRef = useRefFrom(messageId);
  const onActiveRef = useRefFrom(onActive);
  const onLeaveRef = useRefFrom(onLeave);
  const rootRef = useRef<HTMLDivElement>();

  useImperativeHandle(
    ref,
    () => ({
      focusContent() {
        bodyRef.current?.setAttribute('tabindex', '-1');
        bodyRef.current?.focus();
      }
    }),
    [bodyRef]
  );

  // Revert the change after blur.
  const handleContentBlur = useCallback(() => {
    bodyRef.current?.removeAttribute('role');
    bodyRef.current?.removeAttribute('tabindex');
  }, [bodyRef]);

  // Required: this is from C+AI accessibility team, on pressing ENTER, the content should be role="document" and focus(), and focus() requires tabIndex={-1}.
  const handleContentFocus = useCallback(() => {
    bodyRef.current?.setAttribute('role', 'document');
    bodyRef.current?.setAttribute('tabindex', '-1'); // TODO: Do we still need this?

    onActiveRef.current?.(messageIdRef.current, 'content');
  }, [bodyRef, messageIdRef, onActiveRef]);

  const handleHeaderClick = useCallback(() => bodyRef.current?.focus(), [bodyRef]);

  const handleKeyDown = useCallback<KeyboardEventHandler<unknown>>(
    event => {
      if (event.key === 'Escape') {
        // Regardless of where the focus is inside the content, when ESCAPE key is pressed, send the focus back to chat history.
        // If ESCAPE key need to be handled by the content, it should call event.preventDefault().
        // Opinion: preventDefault() is preferred over stopPropagation() because the content may not know there are inside another container.
        if (!event.defaultPrevented) {
          event.preventDefault();

          onLeaveRef.current?.();
        }
      } else if (event.key === 'Tab' && event.target === bodyRef.current) {
        // Special case: if the content is non-interactive, after focusing on the message body, pressing the TAB key should not send the focus to next message.
        // In other words, we should trap the TAB key.

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

  // This `onActive` is emitted on click, could fire multiple rounds even the message is already active.
  // TODO: Find ways to reduce emitting `onActive` when the message is already active.
  const handleRootClick = useCallback(
    event => onActiveRef.current?.(messageIdRef.current, isElementFocusable(event.target) ? 'content' : 'container'),
    [messageIdRef, onActiveRef]
  );

  return (
    <article // Required: children of role="feed" must be role="article".
      aria-labelledby={headerId} // Required: we just want screen reader to narrate header. Without this, it will narrate the whole content.
      className={cx('chat-message', { 'chat-message__is-active': activeMode })}
      data-testid="chat message"
      id={id}
      onClick={handleRootClick}
      ref={rootRef}
    >
      <h4
        className="chat-message__header"
        id={headerId}
        // Windows Narrator: In scan mode, when user press ENTER, we will get onClick and we can use it to focus into the message.
        //                   However, this item should be hidden as we want to prevent mouse clicks.
        onClick={handleHeaderClick}
      >
        {abstract}
      </h4>
      <div
        aria-labelledby={contentId} // Narrator quirks: without aria-labelledby, after pressing ENTER and focus on this element, Narrator will say nothing.
        className="chat-message__body"
        data-testid="chat message body"
        onBlur={handleContentBlur} // Required: revert role="document" and tabIndex="-1" when content is blurred.
        onFocus={handleContentFocus} // Required: set role="document" and tabIndex="-1" when content is focused.
        onKeyDown={handleKeyDown} // Required: pressing ESCAPE key should send the focus back to chat history.
        ref={bodyRef}
      >
        <div className="chat-message__content" id={contentId}>
          <focus-trap onescapekeydown={onLeave}>{children}</focus-trap>
        </div>
      </div>
    </article>
  );
}

type UseRefAsStateSetterInit = { readonly shouldRenderOnChange: boolean };

function useRefAsState<T>(
  initialValue: T | (() => T)
): readonly [RefObject<T> & { current: T }, (value: SetStateAction<T>, init: UseRefAsStateSetterInit) => void] {
  const [, forceRender] = useState<object>();
  const ref = useRef(typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);

  const setState = useCallback(
    (value: SetStateAction<T>, init: UseRefAsStateSetterInit): void => {
      const nextValue = typeof value === 'function' ? (value as (prevState: T) => T)(ref.current) : value;

      if (!Object.is(ref.current, nextValue)) {
        ref.current = nextValue;

        init.shouldRenderOnChange && forceRender({});
      }
    },
    [forceRender, ref]
  );

  return [ref, setState];
}

function ChatHistory({ messages, onLeave }: { readonly messages: readonly Message[]; readonly onLeave: () => void }) {
  const [rawActiveMessageIdRef, setRawActiveMessageId] = useRefAsState<string | undefined>(undefined);
  const bodyRef = useRef<HTMLDivElement>();
  const messageAPIMapRef = useRef<Map<string, MutableRefObject<ChatMessageAPI>>>(new Map());
  const messagesRef = useRefFrom(messages);
  const onLeaveRef = useRefFrom(onLeave);
  const rootRef = useRef<HTMLDivElement>();

  // Explicitly move the focus when: "messages" props changed while the chat history is not focused.
  useMemo(() => {
    const { activeElement } = document;
    const { current: root } = rootRef;

    if (!(Object.is(root, activeElement) || root?.contains(activeElement))) {
      setRawActiveMessageId(messages.at(-1)?.id, { shouldRenderOnChange: false });
    }

    const nextMessageIds = new Set(messages.map(({ id }) => id));
    const messageIds = new Set(messageAPIMapRef.current.keys());

    for (const id of nextMessageIds.difference(messageIds)) {
      messageAPIMapRef.current.set(id, { current: undefined });
    }

    for (const id of messageIds.difference(nextMessageIds)) {
      messageAPIMapRef.current.delete(id);
    }
  }, [messageAPIMapRef, messages, rootRef]);

  const activeMessageId = rawActiveMessageIdRef.current || messages.at(-1)?.id;

  const setActiveMessageId = useCallback<Dispatch<SetStateAction<string>>>(
    nextActiveMessageId => setRawActiveMessageId(nextActiveMessageId, { shouldRenderOnChange: true }),
    [messagesRef, setRawActiveMessageId]
  );

  const setActiveMessageIndex = useCallback<Dispatch<SetStateAction<number>>>(
    nextActiveMessageIndex => {
      setActiveMessageId(activeMessageId => {
        const index = activeMessageId
          ? messagesRef.current?.findIndex(message => message.id === activeMessageId)
          : messagesRef.current?.length - 1;

        if (typeof nextActiveMessageIndex === 'function') {
          nextActiveMessageIndex = nextActiveMessageIndex(index);
        }

        nextActiveMessageIndex = Math.max(0, Math.min(messagesRef.current?.length - 1, nextActiveMessageIndex));

        return messagesRef.current?.at(nextActiveMessageIndex)?.id;
      });
    },
    [messagesRef, setActiveMessageId]
  );

  const handleKeyDown = useCallback(
    event => {
      if (document.activeElement === rootRef.current) {
        if (event.key === 'ArrowUp') {
          event.stopPropagation();

          setActiveMessageIndex(index => index - 1);
        } else if (event.key === 'ArrowDown') {
          event.stopPropagation();

          setActiveMessageIndex(index => index + 1);
        } else if (event.key === 'Enter') {
          event.stopPropagation();

          messageAPIMapRef.current.get(rawActiveMessageIdRef.current).current?.focusContent();
        } else if (event.key === 'Escape') {
          if (!event.defaultPrevented) {
            // We like this, when pressing ESCAPE key on chat history, send the focus to send box.
            onLeaveRef.current?.();
          }
        } else if (event.key === 'Tab') {
          // When tabbing out of chat history, skip all message bodies.
          bodyRef.current?.setAttribute('inert', '');

          requestAnimationFrame(() => bodyRef.current?.removeAttribute('inert'));
        }
      }
    },
    [bodyRef, messageAPIMapRef, onLeaveRef, rawActiveMessageIdRef, setActiveMessageIndex]
  );

  const handleMessageActive = useCallback(
    (id, where) => {
      setActiveMessageId(id);

      // If the message content is focused (e.g. focusing on text box inside the message), don't send the focus to chat history.
      // Otherwise, send the focus to chat history and use active descendant to mark the message as active.
      where !== 'content' && rootRef.current?.focus();
    },
    [rootRef, setActiveMessageId]
  );

  // If ESCAPE key is pressed on the message, the <ChatMessage> will emit `onLeave` event.
  // We should send the focus to chat history.
  const handleMessageLeave = useCallback(() => rootRef.current?.focus(), [rootRef]);

  return (
    <div
      aria-activedescendant={activeMessageId ? `chat__message-id--${activeMessageId}` : undefined} // Matter of taste: we are using active descendant to control focus, instead of roving tab index.
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
        {messages.map(message => {
          const isActive = activeMessageId === message.id;

          return (
            <ChatMessage
              abstract={message.abstract}
              activeMode={isActive ? 'active' : undefined}
              id={`chat__message-id--${message.id}`}
              messageId={message.id}
              onActive={handleMessageActive}
              onLeave={isActive ? handleMessageLeave : undefined}
              ref={messageAPIMapRef.current.get(message.id)}
            >
              {message.children}
            </ChatMessage>
          );
        })}
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

function ChatApp({ messages }) {
  const sendBoxRef = useRef<HTMLTextAreaElement>();

  const handleChatHistoryLeave = useCallback(() => sendBoxRef.current?.focus(), [sendBoxRef]);

  return (
    <div
      className="chat-app"
      data-testid="chat app"
      role="application" // Required: role="document" will only work when its container has role="application".
    >
      <ChatHistory messages={messages} onLeave={handleChatHistoryLeave} />
      <SendBox ref={sendBoxRef} />
    </div>
  );
}

const mainElement = document.querySelector('main');
const root = mainElement && createRoot(mainElement);

root.render(<ChatApp messages={CHAT_MESSAGES} />);

window.addEventListener('addmessage', () => {
  root.render(
    <ChatApp
      messages={Object.freeze([
        ...CHAT_MESSAGES,
        {
          abstract: 'Bot said: Thank you.',
          children: <p>Thank you.</p>,
          id: 'a-00004'
        }
      ])}
    />
  );
});
