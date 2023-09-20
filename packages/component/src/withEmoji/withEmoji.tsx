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

import useUndoStack from './private/useUndoStack';

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
  const inputElementRef = useRef<H>(null);
  const onChangeRef = useRefFrom(onChange);

  const { push, undo } = useUndoStack(inputElementRef);
  const valueRef = useRefFrom(value);

  const handleChange = useCallback<(event: ChangeEvent<H>) => void>(
    ({ currentTarget }) => {
      const { selectionEnd, selectionStart, value } = currentTarget;

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
            push();

            const nextValue = `${value.slice(0, selectionEnd - length)}${emoji}${value.slice(selectionEnd)}`;
            const nextSelectionEnd = selectionEnd + emoji.length - length;

            currentTarget.value = nextValue;

            currentTarget.selectionStart = selectionStart;
            currentTarget.selectionEnd = nextSelectionEnd;

            break;
          }
        }
      }

      value || push();

      onChangeRef.current?.(currentTarget.value);
    },
    [push, emojiMap, onChangeRef, valueRef]
  );

  const handleFocus = useCallback<(event: FocusEvent<H>) => void>(() => push(), [push]);

  const handleKeyDown = useCallback<(event: KeyboardEvent<H>) => void>(
    // eslint-disable-next-line complexity
    event => {
      const { ctrlKey, key, metaKey } = event;

      const uppercaseKey = key.toUpperCase();

      if ((ctrlKey || metaKey) && uppercaseKey === 'Z') {
        event.preventDefault();

        undo();

        onChangeRef.current?.(event.currentTarget.value);
      } else if (key === 'Backspace') {
        push('backspace');
      } else if (key === 'Delete') {
        push('delete');
      } else if (
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'ArrowUp' ||
        key === 'ArrowDown' ||
        key === 'Home' ||
        key === 'End' ||
        key === 'PageUp' ||
        key === 'PageDown' ||
        ((ctrlKey || metaKey) && uppercaseKey === 'A') ||
        ((ctrlKey || metaKey) && (uppercaseKey === 'V' || uppercaseKey === 'X'))
      ) {
        push();
      } else {
        push('change');
      }
    },
    [push, onChangeRef, undo]
  );

  useMemo(
    () => (!inputElementRef.current || inputElementRef.current.value !== value) && push(),
    [push, inputElementRef, value]
  );

  return React.createElement(componentType, {
    ...componentProps,
    onChange: handleChange,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
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
