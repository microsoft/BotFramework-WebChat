// @ts-ignore
import { useRefFrom } from 'https://esm.sh/use-ref-from';
// @ts-ignore
import {
  type Dispatch,
  forwardRef,
  type KeyboardEventHandler,
  MouseEventHandler,
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
// 3. Roving tab index is simpler than active descendant
//    - CSS styling can simply use `:focus`

type ChatMessageAPI = {
  readonly focusContent: () => void;
  readonly focusRoot: () => void;
  readonly id: string;
};

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
              <input data-testid="street address textbox" type="text" />
            </div>
          </label>
        </div>
        <div>
          <label>
            City
            <div>
              <input type="text" />
            </div>
          </label>
        </div>
        <div>
          <label>
            State
            <div>
              <select>
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

function ChatMessage({ abstract, children, id, messageId, onFocus, ref }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentId = useMemo(() => crypto.randomUUID(), []);
  const headerId = useMemo(() => crypto.randomUUID(), []);
  const messageIdRef = useRefFrom(messageId);
  const onFocusRef = useRefFrom(onFocus);
  const rootRef = useRef<HTMLDivElement>(null);

  const focusContent = useCallback(() => {
    bodyRef.current?.setAttribute('tabindex', '-1');
    bodyRef.current?.focus();
  }, [bodyRef]);

  const focusRoot = useCallback(() => {
    rootRef.current?.setAttribute('tabindex', '0');
    rootRef.current?.focus();
  }, [rootRef]);

  useImperativeHandle(ref, () => Object.freeze({ focusContent, focusRoot, id }), [focusContent, focusRoot, id]);

  // Revert the change after blur.
  const handleContentBlur = useCallback(() => {
    bodyRef.current?.removeAttribute('tabindex');
  }, [bodyRef]);

  const handleContentFocus = useCallback(() => {
    // As the message content is already focused, we have already set tabIndex={-1} somewhere.
    // We just need to notify chat history we are being focused.
    onFocusRef.current?.(messageIdRef.current, 'content');
  }, [messageIdRef, onFocusRef]);

  const handleContentKeyDown = useCallback<KeyboardEventHandler<unknown>>(
    event => {
      if (event.key === 'Escape') {
        // Regardless of where the focus is inside the content, when ESCAPE key is pressed, send the focus back to chat history.
        // If ESCAPE key need to be handled by the content, it should call event.preventDefault().
        // Opinion: preventDefault() is preferred over stopPropagation() because the content may not know there are inside another container.
        if (!event.defaultPrevented) {
          event.preventDefault();

          focusRoot();
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
    [bodyRef, focusRoot]
  );

  // This is for screen reader. The header should be sized 0x0 and not clickable by mouse or keyboard.
  // Windows Narrator quirks: In scan mode, press H key to put virtual cursor on the header, then press ENTER key, it will NOT fire header.onclick.
  //                          Instead, it will fire root.onclick.
  //                          We are not sure why it happens this way, even we set <header tabIndex={0}>, it still fire root.onclick.
  const handleHeaderClick = useCallback(
    event => {
      // Don't leak the event to root.onClick.
      event.stopPropagation();

      ref.current.focusContent();
    },
    [ref]
  );

  // This is for mouse click and Windows Narrator scan mode click.
  const handleRootClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    // Windows Narrator: When pressing "H" key to focus on the header and press ENTER, it fire <ChatMessage.root>.onClick, instead of <ChatMessage.header>.onClick.
    //                   Thus, we need to focusContent() instead of focusRoot().
    const { activeElement } = document;

    // If the content is already focused, for example, the <input> inside the content is focused.
    // We should not send the focus back to the body as it would blur <input>.
    if (!(activeElement === bodyRef.current || bodyRef.current?.contains(activeElement))) {
      focusContent();
    }
  }, [bodyRef, focusContent]);

  const handleRootFocus = useCallback(() => {
    // Windows Narrator: when pressing H key to jump across messages, it automatically fire <ChatMessage.root>.onFocus automatically.
    onFocusRef.current?.(messageIdRef.current);
  }, [onFocusRef, messageIdRef]);

  return (
    <article // Required: children of role="feed" must be role="article".
      aria-labelledby={headerId} // Required: we just want screen reader to narrate header. Without this, it will narrate the whole content.
      className="chat-message"
      data-testid="chat message"
      id={id}
      onClick={handleRootClick}
      onFocus={handleRootFocus}
      ref={rootRef}
    >
      <h1 className="chat-message__header" id={headerId} onClick={handleHeaderClick} tabIndex={0}>
        {abstract}
      </h1>
      <div
        aria-labelledby={contentId} // Narrator quirks: without aria-labelledby, after pressing ENTER and focus on this element, Windows Narrator will say nothing.
        className="chat-message__body"
        data-testid="chat message body"
        onBlur={handleContentBlur} // Required: revert tabIndex="-1" when content is blurred.
        onFocus={handleContentFocus} // Required: notify chat history this message is focused.
        onKeyDown={handleContentKeyDown} // Required: pressing ESCAPE key should send the focus back to chat history.
        ref={bodyRef}
      >
        {/* Can we simplify the structure below? */}
        <div className="chat-message__content" id={contentId}>
          <focus-trap onescapekeydown={focusRoot}>{children}</focus-trap>
        </div>
      </div>
    </article>
  );
}

function ChatHistory({ messages, onLeave }: { readonly messages: readonly Message[]; readonly onLeave: () => void }) {
  const [focusedMessageIdRef, setFocusedMessageIDRef] = useRefAsState<string | undefined>(undefined);
  const bodyRef = useRef<HTMLDivElement>(null);
  const messageAPIMapRef = useRef<Map<string, MutableRefObject<ChatMessageAPI | undefined>>>(new Map());
  const messagesRef = useRefFrom(messages);
  const onLeaveRef = useRefFrom(onLeave);
  const rootRef = useRef<HTMLDivElement>(null);

  useMemo(() => {
    const { activeElement } = document;
    const { current: root } = rootRef;

    // Explicitly move the focus to newly added message when "messages" props changed while the chat history is not focused.
    if (!(Object.is(root, activeElement) || root?.contains(activeElement))) {
      focusedMessageIdRef.current = messages.at(-1)?.id;
    }

    // Compile `messageAPIMapRef` so we can call <ChatMessage> API later.
    const nextMessageIds = new Set(messages.map(({ id }) => id));
    const messageIds = new Set(messageAPIMapRef.current.keys());

    for (const id of nextMessageIds.difference(messageIds)) {
      messageAPIMapRef.current.set(id, { current: undefined });
    }

    for (const id of messageIds.difference(nextMessageIds)) {
      messageAPIMapRef.current.delete(id);
    }
  }, [focusedMessageIdRef, messageAPIMapRef, messages, rootRef]);

  const focusMessageByIndex = useCallback<Dispatch<SetStateAction<number>>>(
    nextFocusedMessageIndex => {
      if (typeof nextFocusedMessageIndex === 'function') {
        let focusedMessageIndex: number;

        if (focusedMessageIdRef.current) {
          const { current: focusedMessageId } = focusedMessageIdRef;

          focusedMessageIndex = messagesRef.current?.findIndex(({ id }) => id === focusedMessageId);
        } else {
          focusedMessageIndex = messagesRef.length - 1;
        }

        nextFocusedMessageIndex = nextFocusedMessageIndex(focusedMessageIndex);
      }

      nextFocusedMessageIndex = Math.max(0, Math.min(messagesRef.current.length - 1, nextFocusedMessageIndex));

      const focusedMessageId = messagesRef.current?.at(nextFocusedMessageIndex)?.id;

      setFocusedMessageIDRef(focusedMessageId, { shouldRenderOnChange: false });

      messageAPIMapRef.current.get(focusedMessageId)?.current?.focusRoot();
    },
    [focusedMessageIdRef, messageAPIMapRef, messagesRef, setFocusedMessageIDRef]
  );

  const handleFocusSentinelFocus = useCallback(() => {
    const { current: focusedMessageId } = focusedMessageIdRef;

    focusedMessageId && messageAPIMapRef.current.get(focusedMessageId)?.current?.focusRoot();
  }, [focusedMessageIdRef, messageAPIMapRef]);

  const handleKeyDown = useCallback(
    event => {
      if (event.defaultPrevented) {
        return;
      }

      const isFocusingOnMessageRoot = document.activeElement?.parentElement === bodyRef.current;

      if (isFocusingOnMessageRoot) {
        if (event.key === 'ArrowUp') {
          event.stopPropagation();

          focusMessageByIndex(index => index - 1);
        } else if (event.key === 'ArrowDown') {
          event.stopPropagation();

          focusMessageByIndex(index => index + 1);
        } else if (event.key === 'Enter') {
          event.stopPropagation();

          const { current: focusedMessageId } = focusedMessageIdRef;

          focusedMessageId && messageAPIMapRef.current.get(focusedMessageId)?.current?.focusContent();
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
    [bodyRef, messageAPIMapRef, onLeaveRef, focusMessageByIndex, focusedMessageIdRef]
  );

  const handleMessageFocus = useCallback(
    id => setFocusedMessageIDRef(id, { shouldRenderOnChange: false }),
    [setFocusedMessageIDRef]
  );

  return (
    <div className="chat-history" data-testid="chat history" ref={rootRef}>
      <section
        className="chat-history__body"
        onKeyDown={handleKeyDown}
        ref={bodyRef}
        role="feed" // Required: we are using role="feed/article" to represent the chat thread.
      >
        <div className="focus-sentinel" onFocus={handleFocusSentinelFocus} role="none" tabIndex={0} />
        {messages.map(message => (
          <ChatMessage
            abstract={message.abstract}
            id={`chat__message-id--${message.id}`}
            messageId={message.id}
            onFocus={handleMessageFocus}
            ref={messageAPIMapRef.current.get(message.id)}
          >
            {message.children}
          </ChatMessage>
        ))}
        <div className="focus-sentinel" onFocus={handleFocusSentinelFocus} role="none" tabIndex={0} />
      </section>
    </div>
  );
}

const SendBox = forwardRef<HTMLTextAreaElement>(function SendBox(_, ref) {
  const handleSubmit = useCallback(event => event.preventDefault(), []);

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
  const sendBoxRef = useRef<HTMLTextAreaElement>(null);

  const handleChatHistoryLeave = useCallback(() => sendBoxRef.current?.focus(), [sendBoxRef]);

  return (
    <div className="chat-app" data-testid="chat app">
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
