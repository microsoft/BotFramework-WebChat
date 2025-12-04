/* eslint-disable complexity */
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
  // @ts-ignore
  useId,
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
//    - One less DOM element (active descendant requires role="group" while we also need role="feed/article")
//    - CSS styling can simply use `:focus` and `:focus-within`

type ChatMessageAPI = {
  /** When called, focus on the message. */
  readonly focus: () => void;
  /** ID of the message. */
  readonly id: string;
};

type Message = {
  readonly abstract: string;
  readonly children: ReactNode | undefined;
  readonly id: string;
};

const CHAT_MESSAGES: readonly Message[] = Object.freeze([
  {
    // "abstract" can be built using a new "activity abstract middleware". Not sure if we should support React elements or just plain text.
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

function ChatMessage({ abstract, children, id, messageId, onFocus, onJumpToNext, onJumpToPrevious, onLeave, ref }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyId = useId();
  const headerId = useId();
  const messageIdRef = useRefFrom(messageId);
  const onFocusRef = useRefFrom(onFocus);
  const onJumpToNextRef = useRefFrom(onJumpToNext);
  const onJumpToPreviousRef = useRefFrom(onJumpToPrevious);
  const onLeaveRef = useRefFrom(onLeave);
  const rootRef = useRef<HTMLDivElement>(null);

  const focusBody = useCallback(() => {
    bodyRef.current?.setAttribute('tabindex', '-1');
    bodyRef.current?.focus();
  }, [bodyRef]);

  const focusRoot = useCallback(() => {
    rootRef.current?.focus();
  }, [rootRef]);

  // Revert the change after blur.
  const handleBodyBlur = useCallback(() => {
    bodyRef.current?.removeAttribute('tabindex');
  }, [bodyRef]);

  const handleBodyFocus = useCallback(() => {
    // As the message body is already focused, we have already set tabIndex={-1} somewhere.
    // We just need to notify chat history we are being focused.
    onFocusRef.current?.(messageIdRef.current);
  }, [messageIdRef, onFocusRef]);

  const handleBodyKeyDown = useCallback<KeyboardEventHandler<unknown>>(
    event => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.target === bodyRef.current) {
        if (event.key === 'Escape') {
          // Regardless of where the focus is inside the content, when ESCAPE key is pressed, send the focus back to chat history.
          // If ESCAPE key need to be handled by the content, it should call event.preventDefault().
          // Opinion: preventDefault() is preferred over stopPropagation() because the content may not know there are inside another container.
          focusRoot();
        } else if (event.key === 'Tab') {
          const focusables = Array.from<HTMLElement>(
            bodyRef.current?.querySelectorAll(FOCUSABLE_SELECTOR_QUERY)
          ).filter(element => !element.closest('[inert]') && element.offsetParent);

          if (!focusables.length) {
            // Special case: if the content is non-interactive, after focusing on the message body, pressing the TAB or SHIFT-TAB key should not send the focus away.
            // In other words, we should trap the TAB and SHIFT-TAB key.
            event.preventDefault();
          } else if (event.shiftKey) {
            // Special case: If the content is interactive, press SHIFT-TAB key should send the focus to the last focusable inside the focus trap.
            //               So both TAB and SHIFT-TAB on the message body will send the focus inside the focus trap.
            focusables.at(-1)?.focus();

            event.preventDefault();
          }

          // We don't call preventDefault() if it's a TAB on an interactive message.
          // Because the TAB on interactive message should send the focus toe the first focusable naturally.
        }
      }
    },
    [bodyRef, focusRoot]
  );

  // This is for screen reader only. The header should be visually sized 0px x 0px and it should not be clickable by mouse or keyboard.
  // Windows Narrator quirks: In scan mode, press H key to put virtual cursor on the header, then press ENTER key.
  //                          It should fire header.onClick. However, fire root.onClick instead and never header.onClick.
  //                          We are not sure why it happens this way, even we set <header tabIndex={0}>, it still fire root.onClick.
  const handleHeaderClick = useCallback(
    event => {
      // Don't leak the event to root.onClick.
      event.stopPropagation();

      focusBody();
    },
    [focusBody]
  );

  // This is for mouse click and Windows Narrator scan mode click.
  const handleRootClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    // Windows Narrator: When pressing "H" key to focus on the header and press ENTER, it fire <ChatMessage.root>.onClick, instead of <ChatMessage.header>.onClick.
    //                   Thus, we need to focusBody() instead of focusRoot().
    const { activeElement } = document;

    // If the body is already focused, for example, the <input> inside the body is focused.
    // We should not send the focus back to the body as it would blur <input>.
    if (!(activeElement === bodyRef.current || bodyRef.current?.contains(activeElement))) {
      focusBody();
    }
  }, [bodyRef, focusBody]);

  const handleRootFocus = useCallback(() => {
    // Windows Narrator: when pressing H key to jump across messages, it automatically fire <ChatMessage.root>.onFocus automatically.
    onFocusRef.current?.(messageIdRef.current);
  }, [onFocusRef, messageIdRef]);

  const handleRootKeyDown = useCallback<KeyboardEventHandler<unknown>>(
    event => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.target === rootRef.current) {
        if (event.key === 'Escape') {
          onLeaveRef.current?.(messageIdRef.current, 'escape');
        } else if (event.key === 'Enter') {
          focusBody();
        } else if (event.key === 'Tab') {
          onLeaveRef.current?.(messageIdRef.current, 'tab');
        } else if (event.key === 'ArrowUp') {
          onJumpToPreviousRef.current?.();
        } else if (event.key === 'ArrowDown') {
          onJumpToNextRef.current?.();
        }
      }
    },
    [focusBody, onJumpToNextRef, onJumpToPreviousRef, onLeaveRef]
  );

  useImperativeHandle(ref, () => Object.freeze({ focus: focusRoot, id }), [focusRoot, id]);

  return (
    <article // Required: children of role="feed" must be role="article".
      aria-labelledby={headerId} // Required: we just want screen reader to narrate header. Without this, it will narrate the whole content.
      className="chat-message"
      data-testid="chat message"
      id={id}
      onClick={handleRootClick}
      onFocus={handleRootFocus}
      onKeyDown={handleRootKeyDown}
      ref={rootRef}
      // We don't exactly need roving tab index:
      // - Assume all 3 messages are interactive and the 2nd message was last focused
      //     - When TAB from above, it would land on the interactive content in 1st message, we need to use sentinel to mark things as inert momentarily
      //     - When TAB from below, it would land on the interactive content in 3rd message, we also need to use sentinel
      // Either direction, when we are focusing from outside, we need to use sentinel.
      // Roving tab index is not useful for "saving what was last focused." We need to use sentinel anyway.
      // Therefore, we set all tabIndex={0} for simplicity.
      tabIndex={0}
    >
      <h1 className="chat-message__header" id={headerId} onClick={handleHeaderClick} tabIndex={-1}>
        {abstract}
      </h1>
      <div // This element serve almost a single purpose, ability to programmatically focus on this element. I.e. set tabIndex={-1} then call focus(), revert on blur. Perhaps, we can componentize it out.
        aria-labelledby={bodyId} // Narrator quirks: without aria-labelledby, after pressing ENTER and focus on this element, Windows Narrator will say nothing.
        className="chat-message__body"
        data-testid="chat message body"
        onBlur={handleBodyBlur} // Required: revert tabIndex="-1" when body is blurred.
        onFocus={handleBodyFocus} // Required: notify chat history that this message is being focused.
        onKeyDown={handleBodyKeyDown}
        ref={bodyRef}
      >
        <focus-trap id={bodyId} onescapekeydown={focusRoot}>
          {children}
        </focus-trap>
      </div>
    </article>
  );
}

function ChatHistory({ messages, onLeave }: { readonly messages: readonly Message[]; readonly onLeave: () => void }) {
  // Message ID is the source-of-truth of what message is focused.
  // - We tried ChatMessage API ref, however, it is only available after rendering, i.e. useEffect, not great.
  const [focusedMessageIdRef, setFocusedMessageIDRef] = useRefAsState<string | undefined>(undefined);
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

      messageAPIMapRef.current.get(focusedMessageId)?.current?.focus();
    },
    [focusedMessageIdRef, messageAPIMapRef, messagesRef, setFocusedMessageIDRef]
  );

  const handleFocusSentinelFocus = useCallback(() => {
    const { current: focusedMessageId } = focusedMessageIdRef;

    focusedMessageId && messageAPIMapRef.current.get(focusedMessageId)?.current?.focus();
  }, [focusedMessageIdRef, messageAPIMapRef]);

  // Q: Why not capturing via up/down arrow key?
  // A: If the message is focused by mouse click, we still need to capture what is focused.
  const handleMessageFocus = useCallback(
    id => setFocusedMessageIDRef(id, { shouldRenderOnChange: false }),
    [setFocusedMessageIDRef]
  );

  const handleMessageJumpToNext = useCallback(() => {
    focusMessageByIndex(index => index + 1);
  }, [focusMessageByIndex]);

  const handleMessageJumpToPrevious = useCallback(() => {
    focusMessageByIndex(index => index - 1);
  }, [focusMessageByIndex]);

  const handleMessageLeave = useCallback(
    (_, by) => {
      if (by === 'tab') {
        // When tabbing out of chat history, skip all message bodies.
        rootRef.current?.setAttribute('inert', '');

        requestAnimationFrame(() => rootRef.current?.removeAttribute('inert'));
      } else {
        by satisfies 'escape';

        // Jump to send box.
        onLeaveRef.current?.();
      }
    },
    [onLeaveRef]
  );

  return (
    <section
      className="chat-history"
      data-testid="chat history"
      ref={rootRef}
      role="feed" // Required: we are using role="feed/article" to represent the chat thread.
    >
      <div className="focus-sentinel" onFocus={handleFocusSentinelFocus} role="none" tabIndex={0} />
      {messages.map(message => (
        <ChatMessage
          abstract={message.abstract}
          id={`chat__message-id--${message.id}`}
          messageId={message.id}
          onFocus={handleMessageFocus}
          onJumpToNext={handleMessageJumpToNext}
          onJumpToPrevious={handleMessageJumpToPrevious}
          onLeave={handleMessageLeave}
          ref={messageAPIMapRef.current.get(message.id)}
        >
          {message.children}
        </ChatMessage>
      ))}
      <div className="focus-sentinel" onFocus={handleFocusSentinelFocus} role="none" tabIndex={0} />
    </section>
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
