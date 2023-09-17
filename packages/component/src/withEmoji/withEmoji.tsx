import { useRefFrom } from 'use-ref-from';
import mergeRefs from 'merge-refs';
import React, {
  type ChangeEvent,
  type ComponentType,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  type Ref
} from 'react';

import useUndoReducer from './private/useUndoReducer';

export type InputTargetProps<H> = {
  onChange?: (event: ChangeEvent<H>) => void;
  onFocus?: (event: FocusEvent<H>) => void;
  onKeyDown?: (event: KeyboardEvent<H>) => void;
  onKeyUp?: (event: KeyboardEvent<H>) => void;
  onSelect?: (event: SyntheticEvent<H>) => void;
  value?: string;
};

type PropsOf<T> = T extends ComponentType<infer P> ? P : never;

function WithEmojiController<
  T extends ComponentType<P>,
  P extends InputTargetProps<H> = PropsOf<T>,
  H extends HTMLInputElement | HTMLTextAreaElement = P extends InputTargetProps<infer H> ? H : never
>({
  componentProps,
  componentType,
  emojiMap = new Map<string, string>(),
  innerRef,
  onChange
}: Readonly<{
  componentProps: P;
  componentType: ComponentType<P>;
  emojiMap?: Map<string, string>;
  innerRef?: Ref<H>;
  onChange?: (value: string | undefined) => void;
}>) {
  const { value } = componentProps;

  const inputElementRef = useRef<H>(null);
  const onChangeRef = useRefFrom(onChange);
  const valueRef = useRefFrom(value);

  const [undoState, { checkpoint, moveCaret, undo }] = useUndoReducer(inputElementRef);
  const undoStateRef = useRefFrom(undoState);

  // This is for moving the selection while setting the send box value.
  // If we only use setSendBox, we will need to wait for the next render cycle to get the value in, before we can set selectionEnd/Start.
  // const setSelectionRangeAndValue = useCallback(
  //   (value: string, selectionStart: number | null, selectionEnd: number | null) => {
  //     const { current } = inputElementRef;

  //     if (current) {
  //       // We need to set the value, before selectionStart/selectionEnd.
  //       current.value = value;

  //       current.selectionStart = selectionStart;
  //       current.selectionEnd = selectionEnd;
  //     }

  //     committingValueRef.current = value;
  //     onChangeRef.current?.(value);
  //   },
  //   [inputElementRef, onChangeRef]
  // );

  const ignoreNextChangeRef = useRef<boolean>(false);

  const handleChange = useCallback<(event: ChangeEvent<H>) => void>(
    ({ currentTarget }) => {
      const { selectionEnd, selectionStart, value } = currentTarget;

      // if (ignoreNextChangeRef.current) {
      //   ignoreNextChangeRef.current = false;
      // } else {
      //   checkpoint('change');
      // }

      // Currently, we cannot detect whether the change is due to clipboard paste or pressing a key on the keyboard.
      // We should not change to emoji when the user is pasting text.
      // We would assume, for a single character addition, the user must be pressing a key.
      if (
        typeof selectionEnd === 'number' &&
        typeof selectionStart === 'number' &&
        selectionStart === selectionEnd &&
        value &&
        value.length === (valueRef.current || '').length + 1
      ) {
        for (const [emoticon, emoji] of emojiMap.entries()) {
          const { length } = emoticon;

          if (value.slice(selectionEnd - length, selectionEnd) === emoticon) {
            checkpoint('move caret');

            const nextValue = `${value.slice(0, selectionEnd - length)}${emoji}${value.slice(selectionEnd)}`;
            const nextSelectionEnd = selectionEnd + emoji.length - length;

            currentTarget.value = nextValue;

            currentTarget.selectionStart = selectionStart;
            currentTarget.selectionEnd = nextSelectionEnd;
          }
        }
      }

      if (!value) {
        checkpoint('move caret');
      }

      onChangeRef.current?.(currentTarget.value);
    },
    [checkpoint, emojiMap, onChangeRef, valueRef]
  );

  // const handleFocus = useCallback<(event: FocusEvent<H>) => void>(() => checkpoint('focus'), [checkpoint]);
  const handleFocus = useCallback<(event: FocusEvent<H>) => void>(() => moveCaret(), [moveCaret]);

  const checkpointOnChangeRef = useRef<boolean>(false);

  const handleKeyDown = useCallback<(event: KeyboardEvent<H>) => void>(
    // eslint-disable-next-line complexity
    event => {
      const { ctrlKey, key, metaKey } = event;

      // eslint-disable-next-line no-console
      console.log('key down', key);

      if ((ctrlKey || metaKey) && (key === 'Z' || key === 'z')) {
        event.preventDefault();

        undo();
        onChangeRef.current?.(event.currentTarget.value);
      } else if (ctrlKey && (key === 'g' || key === 'G')) {
        // TODO: Remove this.
        event.preventDefault();

        // eslint-disable-next-line no-console
        console.log(undoStateRef.current.undoStack.map(entry => entry.toString()).join('\n'));
      } else if (key === 'Backspace') {
        checkpoint('backspace');
        // checkpoint('move caret');
        ignoreNextChangeRef.current = true;
      } else if (key === 'Delete') {
        checkpoint('delete');
        // checkpoint('move caret');
        ignoreNextChangeRef.current = true;
      } else if (
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'ArrowUp' ||
        key === 'ArrowDown' ||
        key === 'Home' ||
        key === 'End' ||
        key === 'PageUp' ||
        key === 'PageDown' ||
        ((ctrlKey || metaKey) && (key === 'a' || key === 'A'))
      ) {
        moveCaret();
        checkpointOnChangeRef.current = true;
      } else if ((ctrlKey || metaKey) && (key === 'v' || key === 'V' || key === 'x' || key === 'X')) {
        moveCaret();
        // } else if (checkpointOnChangeRef.current) {
      } else {
        // eslint-disable-next-line no-console
        console.log(event.currentTarget.value);
        checkpoint('change');
        // checkpoint(checkpointOnChangeRef.current ? 'move caret' : 'change');
        checkpointOnChangeRef.current = false;
      }
    },
    [checkpoint, moveCaret, onChangeRef, undo, undoStateRef]
  );

  const handleKeyUp = useCallback<(event: KeyboardEvent<H>) => void>(
    event => {
      const { key } = event;

      // eslint-disable-next-line no-console
      console.log('key press', key);

      if (
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'ArrowUp' ||
        key === 'ArrowDown' ||
        key === 'Home' ||
        key === 'End' ||
        key === 'PageUp' ||
        key === 'PageDown'
      ) {
        // checkpointOnChangeRef.current = true;
        // console.log(
        //   key,
        //   event.currentTarget.value,
        //   event.currentTarget.selectionStart,
        //   event.currentTarget.selectionEnd
        // );
        // moveCaret();
      } else {
        // TODO: Only checkpoint if there is a visible change.
        // checkpoint('change');
      }
    },
    []
    // [checkpoint, moveCaret]
  );

  // const handleSelect = useCallback(
  //   (event: SyntheticEvent<H>): void =>
  //     // When caret move, we should push to undo stack on change.
  //     event.currentTarget.value === valueRef.current && moveCaret(),
  //   [moveCaret, valueRef]
  // );

  useMemo(() => {
    if (!inputElementRef.current || inputElementRef.current.value !== value) {
      checkpoint('set value');
    }
  }, [checkpoint, inputElementRef, value]);

  // useEffect(() => checkpoint('change'), [checkpoint]);

  return React.createElement(componentType, {
    ...componentProps,
    onChange: handleChange,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    // onSelect: handleSelect,
    ref: mergeRefs(inputElementRef, innerRef)
  } as P);
}

export default function withEmoji<
  T extends ComponentType<P>,
  P extends InputTargetProps<H> = PropsOf<T>,
  H extends HTMLInputElement | HTMLTextAreaElement = P extends InputTargetProps<infer H> ? H : never
>(componentType: T) {
  const WithEmoji = forwardRef<
    H,
    Readonly<
      Omit<P, 'emojiMap' | 'onChange'> & {
        emojiMap?: Map<string, string>;
        onChange?: (value: string | undefined) => void;
      }
    >
  >(({ emojiMap, onChange, ...props }, ref) => (
    <WithEmojiController<T, P, H>
      // TODO: Do we have a type bug here?
      componentProps={props as unknown as P}
      componentType={componentType}
      emojiMap={emojiMap}
      innerRef={ref}
      onChange={onChange}
    />
  ));

  WithEmoji.displayName = `WithEmoji<${componentType.displayName}>`;

  return WithEmoji;
}
