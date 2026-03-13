/* eslint-disable complexity */
import classNames from 'classnames';
// @ts-ignore
import { AdaptiveCard, GlobalSettings, HostConfig } from 'https://esm.sh/adaptivecards';
// @ts-ignore
import { useRefFrom } from 'https://esm.sh/use-ref-from';
// @ts-ignore
import {
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  memo,
  useCallback,
  useEffect,
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
//    - One less DOM element (active descendant requires role="group" while we also need role="feed/article").
//    - CSS styling can simply use `:focus` and `:focus-within`.
// 4. We are using focus sentinels to fake roving tab index
//    - When TAB from outside, all messages except the focused one need to be skipped. This is not trivial.
//       - To achieve this, we need `onKeyDown` watching incoming event.key === 'Tab', when it happen, momentarily add `inert` attribute to all messages except the focused
//       - We cannot have `inert` all the time because it intefere with mouse clicks
//       - The `onKeyDown` need to be set outside of chat history, which is not trivial.
//    - Instead of using singular tabIndex={0}, we remember which message was focused, then the sentinels will directly focus on them.
//       - This is like roving tab index, but the last focused is remembered in code, than remembered via the singular tabIndex={0}.

type ChatHistoryAPI = {
  readonly focus: (init: { which: 'last message' }) => void;
};

type ChatMessageAPI = {
  /** When called, focus on the message. */
  readonly focus: (init: { restoreFocus: boolean }) => void;
};

type Message = {
  readonly abstract: string;
  readonly children: ReactNode | undefined;
  readonly id: string;
};

type SendBoxAPI = {
  readonly focus: () => void;
};

const ADAPTIVE_CARD_JSON = {
  type: 'AdaptiveCard',
  version: '1.5',

  body: [
    {
      type: 'Input.Text',
      label: 'Street address'
    },
    {
      type: 'Input.Text',
      label: 'City'
    },
    {
      type: 'Input.ChoiceSet',
      label: 'State',
      choices: [
        { title: 'California', value: 'CA' },
        { title: 'Oregon', value: 'OR' },
        { title: 'Washington', value: 'WA' }
      ],
      style: 'compact'
    }
  ],
  actions: [
    {
      type: 'Action.Submit',
      title: 'Submit'
    }
  ]
};

function AddressForm() {
  const ref = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback(event => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    const adaptiveCard = new AdaptiveCard();

    adaptiveCard.hostConfig = new HostConfig({ containerStyles: { default: { backgroundColor: '#f7f7f7' } } });
    adaptiveCard.onExecuteAction = () => {
      ref.current?.closest('form')?.requestSubmit();
    };

    adaptiveCard.parse(ADAPTIVE_CARD_JSON);

    GlobalSettings.setTabIndexAtCardRoot = false;

    const element = adaptiveCard.render();

    element.querySelector('.ac-textInput').dataset.testid = 'street address textbox';
    element.querySelector('.ac-pushButton').dataset.testid = 'address form submit button';

    ref.current?.appendChild(element);
  }, [ref]);

  return <form data-testid="address form" ref={ref} onSubmit={handleSubmit} />;
}

function Attachment({ children }) {
  return (
    <div role="group">
      <div>{children}</div>
    </div>
  );
}

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
    abstract: 'Bot said: Where should we ship it to? Has an attachment.',
    children: (
      <>
        <p>Where should we ship it to?</p>
        <Attachment>
          <AddressForm />
        </Attachment>
      </>
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

function getFocusableChildren(element: HTMLElement | null | undefined): readonly HTMLElement[] {
  return Object.freeze(
    Array.from<HTMLElement>(element?.querySelectorAll(FOCUSABLE_SELECTOR_QUERY) ?? []).filter(
      element => !element.closest('[inert]') && element.offsetParent
    )
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

// We have onJumpToNext, onJumpToPrevious, onLeave here, instead of capturing `onKeyDown(ArrowUp/ArrowDown/Tab/Escape)` at chat history.
// This will make the code simpler. And there are only 1 component to look at when diagnosing key down issues.
// It will make <ChatMessage> more complex. But the <ChatHistory> become very simple then.
const ChatMessage = memo<{
  abstract: string;
  children?: ReactNode | undefined;
  interactMode: 1 | 2;
  messageId: string;
  onFocus: (messageId: string) => void;
  onJumpToNext: (messageId: string) => void;
  onJumpToPrevious: (messageId: string) => void;
  onLeave: (messageId: string, by: 'escape' | 'shift tab' | 'tab') => void;
  ref: RefObject<ChatMessageAPI | undefined>;
}>(function ChatMessage({
  abstract,
  children,
  interactMode,
  messageId,
  onFocus,
  onJumpToNext,
  onJumpToPrevious,
  onLeave,
  ref
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyId = useId();
  const headerId = useId();
  const interactModeRef = useRefFrom(interactMode);
  const lastFocusableRef = useRef<Element | undefined>(undefined);
  const messageIdRef = useRefFrom(messageId);
  const onFocusRef = useRefFrom(onFocus);
  const onJumpToNextRef = useRefFrom(onJumpToNext);
  const onJumpToPreviousRef = useRefFrom(onJumpToPrevious);
  const onLeaveRef = useRefFrom(onLeave);
  const rootRef = useRef<HTMLDivElement>(null);

  const focusBody = useCallback(
    ({ restoreFocus }) => {
      if (interactModeRef.current === 1) {
        bodyRef.current?.setAttribute('tabindex', '-1');
        bodyRef.current?.focus();
      } else {
        const { current: lastFocusable } = lastFocusableRef;

        if (
          restoreFocus &&
          lastFocusable &&
          'focus' in lastFocusable &&
          typeof lastFocusable.focus === 'function' &&
          bodyRef.current?.contains(lastFocusable)
        ) {
          lastFocusable.focus();
        } else {
          bodyRef.current?.focus();
          lastFocusableRef.current = undefined;
        }
      }
    },
    [bodyRef, interactModeRef]
  );

  const focusRoot = useCallback(
    ({ restoreFocus }) => {
      if (interactModeRef.current === 1) {
        rootRef.current?.focus();
      } else {
        focusBody({ restoreFocus });
      }
    },
    [focusBody, rootRef]
  );

  // Revert the change after blur.
  const handleBodyBlur = useCallback(() => {
    if (interactModeRef.current === 1) {
      setTimeout(() => {
        if (bodyRef.current !== document.activeElement && !bodyRef.current?.contains(document.activeElement)) {
          bodyRef.current?.removeAttribute('tabindex');
        }
      }, 0);
    }
  }, [bodyRef, interactModeRef]);

  const handleBodyKeyDown = useCallback<KeyboardEventHandler<unknown>>(
    event => {
      if (event.defaultPrevented) {
        return;
      }

      if (interactModeRef.current === 1) {
        if (event.target === bodyRef.current) {
          if (event.key === 'Escape') {
            // Regardless of where the focus is inside the content, when ESCAPE key is pressed, send the focus back to chat history.
            // If ESCAPE key need to be handled by the content, it should call event.preventDefault().
            // Opinion: preventDefault() is preferred over stopPropagation() because the content may not know there are inside another container.
            focusRoot({ restoreFocus: false });
          } else if (event.key === 'Tab') {
            const focusables = getFocusableChildren(bodyRef.current);

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
      } else {
        interactModeRef.current satisfies 2;

        const isTargetingBody = event.target === bodyRef.current;

        if (event.key === 'ArrowUp' && isTargetingBody) {
          onJumpToPreviousRef.current?.(messageIdRef.current);
        } else if (event.key === 'ArrowDown' && isTargetingBody) {
          onJumpToNextRef.current?.(messageIdRef.current);
        } else if (event.key === 'Enter' && isTargetingBody) {
          const focusables = getFocusableChildren(bodyRef.current);

          focusables[0]?.focus();
        } else if (event.key === 'Escape') {
          if (isTargetingBody) {
            onLeaveRef.current?.(messageIdRef.current, 'escape');
          } else {
            focusBody({ restoreFocus: false });
          }
        } else if (event.key === 'Tab' && !event.shiftKey) {
          const focusables = getFocusableChildren(bodyRef.current);

          if (!focusables.length || event.target === focusables.at(-1)) {
            // TAB-ing out of the chat message.
            onLeaveRef.current?.(messageIdRef.current, 'tab');
          }
        }
      }
    },
    [bodyRef, focusBody, focusRoot, interactModeRef, messageIdRef, onJumpToNextRef, onJumpToPreviousRef, onLeaveRef]
  );

  const handleFocusTrapLeave = useCallback(() => focusBody({ restoreFocus: false }), [focusBody]);

  // This is for screen reader only. The header should be visually sized 0px x 0px and it should not be clickable by mouse or keyboard.
  // Windows Narrator quirks: In scan mode, press H key to put virtual cursor on the header, then press ENTER key.
  //                          It should fire header.onClick. However, fire root.onClick instead and never header.onClick.
  //                          We are not sure why it happens this way, even we set <header tabIndex={0}>, it still fire root.onClick.
  const handleHeaderClick = useCallback(
    event => {
      // Don't leak the event to root.onClick.
      event.stopPropagation();

      focusBody({ restoreFocus: false });
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
      focusBody({ restoreFocus: false });
    }
  }, [bodyRef, focusBody]);

  // Notify chat history this message is being focused. So focus sentinels will land on this message later.
  // This is actually roving tab index without using tabIndex={0}.
  const handleRootFocus = useCallback(() => {
    // Windows Narrator: when pressing H key to jump across messages, it automatically fire <ChatMessage.root>.onFocus automatically.
    onFocusRef.current?.(messageIdRef.current);

    const { activeElement } = document;
    const { current: body } = bodyRef;

    // Remember what element is focused.
    // When the user focus back to the message, we send the focus back to the element.
    if (body && (activeElement === body || bodyRef.current?.contains(activeElement))) {
      lastFocusableRef.current = activeElement ?? undefined;
    }
  }, [onFocusRef, messageIdRef]);

  const handleRootKeyDown = useCallback<KeyboardEventHandler<unknown>>(
    event => {
      if (event.defaultPrevented) {
        return;
      }

      if (interactModeRef.current === 1) {
        if (event.target === rootRef.current) {
          if (event.key === 'Escape') {
            onLeaveRef.current?.(messageIdRef.current, 'escape');
          } else if (event.key === 'Enter') {
            focusBody({ restoreFocus: false });
          } else if (event.key === 'Tab') {
            onLeaveRef.current?.(messageIdRef.current, 'tab');
          } else if (event.key === 'ArrowUp') {
            onJumpToPreviousRef.current?.(messageIdRef.current);
          } else if (event.key === 'ArrowDown') {
            onJumpToNextRef.current?.(messageIdRef.current);
          }
        }
      } else {
        interactModeRef.current satisfies 2;

        if (event.target === bodyRef.current && event.key === 'Tab' && event.shiftKey) {
          onLeaveRef.current?.(messageIdRef.current, 'shift tab');
        }
      }
    },
    [focusBody, messageIdRef, onJumpToNextRef, onJumpToPreviousRef, onLeaveRef]
  );

  useImperativeHandle(ref, () => Object.freeze({ focus: focusRoot }), [focusRoot]);

  return (
    <article // Required: children of role="feed" must be role="article".
      aria-labelledby={interactMode === 2 ? bodyId : headerId} // Required: we just want screen reader to narrate header. Without this, it will narrate the whole content.
      className="chat-message"
      data-testid="chat message"
      onClick={handleRootClick}
      onFocus={handleRootFocus}
      onKeyDown={handleRootKeyDown}
      ref={rootRef}
      // We don't exactly need roving tab index:
      // - Assume all 3 messages are interactive and the 2nd message was last focused
      //     - When TAB from above, it would land on the interactive content in 1st message, we need to use sentinel to mark things as inert momentarily
      //     - When TAB from below, it would land on the interactive content in 3rd message, we also need to use sentinel
      // Either direction, when we are focusing from outside, we need to skip messages other than the focused one. We are using focus sentinels instead.
      // At the end of the day, roving tab index is not useful for "restoring what was last focused." We will use focus sentinels.
      // Therefore, we set all tabIndex={0} for simplicity.
      tabIndex={interactModeRef.current === 1 ? 0 : undefined}
    >
      <h1
        className="chat-message__header"
        id={headerId}
        onClick={handleHeaderClick}
        // Windows Narrator quirks: All scan mode mode item must have tabIndex. Otherwise it may send the focus to document.body.
        tabIndex={-1}
      >
        {abstract}
      </h1>
      <div
        // This element serve a single purpose, ability to programmatically focus on this element. I.e. set tabIndex={-1} then call focus(), revert on blur.
        // Perhaps, we can componentize it out as <ManualFocusable> component.
        aria-labelledby={bodyId} // Narrator quirks: without aria-labelledby, after pressing ENTER and focus on this element, Windows Narrator will say nothing.
        className="chat-message__body"
        data-testid="chat message body"
        onBlur={handleBodyBlur} // Required: revert tabIndex="-1" when body is blurred.
        onKeyDown={handleBodyKeyDown}
        ref={bodyRef}
        tabIndex={interactMode === 1 ? undefined : 0}
      >
        {interactMode === 1 ? (
          <focus-trap id={bodyId} onescapekeydown={handleFocusTrapLeave}>
            {children}
          </focus-trap>
        ) : (
          children
        )}
      </div>
    </article>
  );
});

function ChatHistory({
  interactMode,
  messages,
  onLeave,
  ref
}: {
  readonly interactMode: 1 | 2;
  readonly messages: readonly Message[];
  readonly onLeave: () => void;
  readonly ref: RefObject<ChatHistoryAPI | undefined>;
}) {
  // Message ID is the source-of-truth of the focused message.
  // - We tried using SoT of ChatMessage API ref, however, it is only available after rendering, i.e. useEffect, not great.
  // - We tried using SoT of message index, it cannot survive message insertions.
  const [focusedMessageIdRef, setFocusedMessageIDRef] = useRefAsState<string | undefined>(undefined);
  const messageAPIMapRef = useRef<Map<string, RefObject<ChatMessageAPI>>>(new Map());
  const messagesRef = useRefFrom(messages);
  const onLeaveRef = useRefFrom(onLeave);
  const rootRef = useRef<HTMLDivElement>(null);

  const focus = useCallback<(focusInit: { which: 'last message' }) => void>(
    ({ which }) => {
      if (which === 'last message') {
        messageAPIMapRef.current.get(messagesRef.current?.at(-1).id)?.current?.focus({ restoreFocus: false });
      }
    },
    [messageAPIMapRef, messagesRef]
  );

  useMemo(() => {
    const { activeElement } = document;
    const { current: root } = rootRef;

    // Explicitly move the focus to newly added message when "messages" props changed while the chat history is not focused.
    if (!root?.contains(activeElement)) {
      focusedMessageIdRef.current = messages.at(-1)?.id;
    }

    // Compile `messageAPIMapRef` so we can call <ChatMessage> API later.
    const nextMessageIds = new Set(messages.map(({ id }) => id));
    const messageIds = new Set(messageAPIMapRef.current.keys());

    for (const id of nextMessageIds.difference(messageIds)) {
      messageAPIMapRef.current.set(id, { current: undefined } as any);
    }

    for (const id of messageIds.difference(nextMessageIds)) {
      messageAPIMapRef.current.delete(id);
    }
  }, [focusedMessageIdRef, messageAPIMapRef, messages, rootRef]);

  const jumpToRelativeMessage = useCallback(
    (messageId: string, relativePosition: number): number => {
      let index = messagesRef.current?.findIndex(({ id }) => id === messageId);
      const messagesLength = messagesRef.current.length;

      if (!~index) {
        index = messagesLength - 1;
      } else if (index + relativePosition < 0) {
        return -Infinity;
      } else if (index + relativePosition >= messagesLength) {
        return Infinity;
      }

      const nextIndex = index + relativePosition;

      const nextFocusedMessageId = messagesRef.current?.at(nextIndex)?.id;

      setFocusedMessageIDRef(nextFocusedMessageId, { shouldRenderOnChange: false });

      messageAPIMapRef.current.get(nextFocusedMessageId)?.current?.focus({ restoreFocus: false });

      return nextIndex;
    },
    [messageAPIMapRef, messagesRef, setFocusedMessageIDRef]
  );

  const handleFocusSentinelFocus = useCallback(() => {
    const { current: focusedMessageId } = focusedMessageIdRef;

    focusedMessageId && messageAPIMapRef.current.get(focusedMessageId)?.current?.focus({ restoreFocus: true });
  }, [focusedMessageIdRef, messageAPIMapRef]);

  // Remember what message is being focused, we need this for TAB-ing from outside (i.e. focus sentinels.)
  // This function is hot path. If the message contains multiple <input>, switching <input> will send them here.
  const handleMessageFocus = useCallback(
    id => setFocusedMessageIDRef(id, { shouldRenderOnChange: false }),
    [setFocusedMessageIDRef]
  );

  const handleMessageJumpToNext = useCallback(
    messageId => {
      if (jumpToRelativeMessage(messageId, 1) === Infinity) {
        onLeaveRef.current?.('down arrow');
      }
    },
    [jumpToRelativeMessage, onLeaveRef]
  );

  const handleMessageJumpToPrevious = useCallback(
    messageId => jumpToRelativeMessage(messageId, -1),
    [jumpToRelativeMessage]
  );

  const handleMessageLeave = useCallback(
    (_, by) => {
      if (by === 'shift tab' || by === 'tab') {
        // When tabbing out of chat history, skip all message bodies so TAB naturally land to the next focusable.
        rootRef.current?.setAttribute('inert', '');

        requestAnimationFrame(() => rootRef.current?.removeAttribute('inert'));
      } else {
        // When ESCAPE key is pressed on the message, jump to send box.
        by satisfies 'escape';
        onLeaveRef.current?.();
      }
    },
    [onLeaveRef]
  );

  useImperativeHandle(ref, () => Object.freeze({ focus }), [focus]);

  return (
    <section
      className={classNames('chat-history', {
        'chat-history--interact-mode-1': interactMode !== 2,
        'chat-history--interact-mode-2': interactMode === 2
      })}
      data-testid="chat history"
      ref={rootRef}
      role="feed" // Required: we are using role="feed/article" to represent the chat thread.
    >
      <div className="focus-sentinel" onFocus={handleFocusSentinelFocus} role="none" tabIndex={0} />
      {messages.map(message => (
        <ChatMessage
          abstract={message.abstract}
          interactMode={interactMode}
          messageId={message.id}
          onFocus={handleMessageFocus}
          onJumpToNext={handleMessageJumpToNext}
          onJumpToPrevious={handleMessageJumpToPrevious}
          onLeave={handleMessageLeave}
          ref={messageAPIMapRef.current.get(message.id)!}
        >
          {message.children}
        </ChatMessage>
      ))}
      <div className="focus-sentinel" onFocus={handleFocusSentinelFocus} role="none" tabIndex={0} />
    </section>
  );
}

const SendBox = memo<{
  readonly onLeave: (how: 'arrow up') => void;
  readonly ref: RefObject<SendBoxAPI | undefined>;
}>(function SendBox({ onLeave, ref }) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const focus = useCallback(() => {
    textAreaRef.current?.focus();
  }, [textAreaRef]);

  const onLeaveRef = useRefFrom(onLeave);

  const handleKeyDown = useCallback(
    event => {
      if (event.key === 'ArrowUp' && event.currentTarget.selectionEnd === 0) {
        onLeaveRef.current?.('arrow up');
      }
    },
    [onLeaveRef]
  );

  const handleSubmit = useCallback(event => event.preventDefault(), []);

  useImperativeHandle(ref, () => Object.freeze({ focus }), [focus]);

  return (
    <form className="send-box" data-testid="send box" onSubmit={handleSubmit}>
      <textarea
        autoFocus={true}
        className="send-box__text-box"
        data-testid="send box text box"
        onKeyDown={handleKeyDown}
        placeholder="Type a message"
        ref={textAreaRef}
      />
    </form>
  );
});

const ChatApp = memo<{ messages: readonly Message[] }>(function ChatApp({ messages }) {
  const chatHistoryRef = useRef<ChatHistoryAPI>();
  const sendBoxRef = useRef<SendBoxAPI>();

  const interactMode = useMemo(() => (new URLSearchParams(location.hash.slice(1)).get('mode') === '2' ? 2 : 1), []);

  const handleChatHistoryLeave = useCallback(() => sendBoxRef.current?.focus(), [sendBoxRef]);
  const handleSendBoxLeave = useCallback(
    how => {
      if (how === 'arrow up') {
        chatHistoryRef.current?.focus({ which: 'last message' });
      }
    },
    [chatHistoryRef]
  );

  return (
    <div className="chat-app" data-testid="chat app">
      <ChatHistory
        messages={messages}
        interactMode={interactMode}
        onLeave={handleChatHistoryLeave}
        ref={chatHistoryRef}
      />
      <SendBox onLeave={handleSendBoxLeave} ref={sendBoxRef} />
    </div>
  );
});

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
