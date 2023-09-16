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
  useEffect,
  useMemo,
  useRef,
  type Ref
} from 'react';

import SelectionAndValue from './private/SelectionAndValue';

export type InputTargetProps<H> = {
  onChange?: (event: ChangeEvent<H>) => void;
  onFocus?: (event: FocusEvent<H>) => void;
  onKeyDown?: (event: KeyboardEvent<H>) => void;
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

  const committingValueRef = useRef<string>(value);
  const inputElementRef = useRef<H>(null);
  const placeCheckpointOnChangeRef = useRef<boolean>(false);
  const prevInputStateRef = useRef<SelectionAndValue>(new SelectionAndValue('', Infinity, Infinity));
  const undoStackRef = useRef<SelectionAndValue[]>([]);
  const valueRef = useRefFrom(value);

  const rememberInputState = useCallback(() => {
    const { current } = inputElementRef;

    if (current) {
      const { selectionEnd, selectionStart, value } = current;

      prevInputStateRef.current = new SelectionAndValue(value, selectionStart, selectionEnd);
    }
  }, [inputElementRef, prevInputStateRef]);

  // This is for moving the selection while setting the send box value.
  // If we only use setSendBox, we will need to wait for the next render cycle to get the value in, before we can set selectionEnd/Start.
  const setSelectionRangeAndValue = useCallback(
    (value: string, selectionStart: number | null, selectionEnd: number | null) => {
      const { current } = inputElementRef;

      if (current) {
        // We need to set the value, before selectionStart/selectionEnd.
        current.value = value;

        current.selectionStart = selectionStart;
        current.selectionEnd = selectionEnd;
      }

      committingValueRef.current = value;
      onChange?.(value);
    },
    [inputElementRef, onChange]
  );

  const handleChange = useCallback<(event: ChangeEvent<H>) => void>(
    ({ currentTarget: { selectionEnd, selectionStart, value } }) => {
      if (placeCheckpointOnChangeRef.current) {
        undoStackRef.current.push(prevInputStateRef.current);

        placeCheckpointOnChangeRef.current = false;
      }

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
            undoStackRef.current.push(new SelectionAndValue(value, selectionStart, selectionEnd));

            placeCheckpointOnChangeRef.current = true;

            value = `${value.slice(0, selectionEnd - length)}${emoji}${value.slice(selectionEnd)}`;
            selectionEnd = selectionEnd += emoji.length - length;
          }
        }
      }

      setSelectionRangeAndValue(value, selectionStart, selectionEnd);
    },
    [emojiMap, placeCheckpointOnChangeRef, prevInputStateRef, setSelectionRangeAndValue, undoStackRef, valueRef]
  );

  const handleFocus = useCallback<(event: FocusEvent<H>) => void>(() => {
    rememberInputState();

    placeCheckpointOnChangeRef.current = true;
  }, [placeCheckpointOnChangeRef, rememberInputState]);

  const handleKeyDown = useCallback<(event: KeyboardEvent<H>) => void>(
    event => {
      const { ctrlKey, key, metaKey } = event;

      if ((ctrlKey || metaKey) && (key === 'Z' || key === 'z')) {
        event.preventDefault();

        const poppedInputState = undoStackRef.current.pop();

        prevInputStateRef.current = poppedInputState || new SelectionAndValue('', 0, 0);

        setSelectionRangeAndValue(
          prevInputStateRef.current.value,
          prevInputStateRef.current.selectionStart,
          prevInputStateRef.current.selectionEnd
        );
      }
    },
    [prevInputStateRef, setSelectionRangeAndValue, undoStackRef]
  );

  const handleSelect = useCallback(
    (event: SyntheticEvent<H>): void => {
      const {
        currentTarget: { selectionEnd, selectionStart, value }
      } = event;

      if (value === prevInputStateRef.current.value) {
        // When caret move, we should push to undo stack on change.
        placeCheckpointOnChangeRef.current = true;
      }

      prevInputStateRef.current = new SelectionAndValue(value, selectionStart, selectionEnd);
    },
    [placeCheckpointOnChangeRef, prevInputStateRef]
  );

  useMemo(() => {
    if (committingValueRef.current !== value) {
      if (placeCheckpointOnChangeRef.current) {
        undoStackRef.current.push(prevInputStateRef.current);
      }

      prevInputStateRef.current = new SelectionAndValue(value, value.length, value.length);
      placeCheckpointOnChangeRef.current = true;
      committingValueRef.current = value;
    }
  }, [placeCheckpointOnChangeRef, undoStackRef, value]);

  useEffect(rememberInputState, [rememberInputState]);

  return React.createElement(componentType, {
    ...componentProps,
    onChange: handleChange,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    onSelect: handleSelect,
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
