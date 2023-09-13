import React, {
  type ComponentType,
  type FocusEventHandler,
  type FormEventHandler,
  type KeyboardEventHandler,
  type ReactEventHandler,
  type Ref,
  useCallback,
  useEffect,
  useRef
} from 'react';

import useReplaceEmoticon from '../../hooks/internal/useReplaceEmoticon';

type SupportedHTMLElement = HTMLInputElement | HTMLTextAreaElement;

export type RequiredProps<H> = {
  onChange: FormEventHandler<H>;
  onFocus: FocusEventHandler<H>;
  onKeyDown: KeyboardEventHandler<H>;
  onSelect: ReactEventHandler<H>;
  ref: Ref<H | null>;
  value: string;
};

type WithEmojiProps<H> = {
  componentType: ComponentType<RequiredProps<H>>;
  // eslint-disable-next-line react/require-default-props
  onChange?: (value: string) => void;
  // eslint-disable-next-line react/require-default-props
  value?: string;
};

type SelectionRange = {
  selectionEnd: number | null;
  selectionStart: number | null;
};

type SelectionAndValue = SelectionRange & {
  value: string;
};

function WithEmojiController<H extends SupportedHTMLElement>({ componentType, onChange, value }: WithEmojiProps<H>) {
  const inputElementRef = useRef<H>(null);
  const placeCheckpointOnChangeRef = useRef<boolean>(false);
  const prevInputStateRef = useRef<SelectionAndValue>();
  const replaceEmoticon = useReplaceEmoticon();
  const undoStackRef = useRef<(SelectionAndValue | undefined)[]>([]);

  const rememberInputState = useCallback(() => {
    const { current } = inputElementRef;

    if (current) {
      const { selectionEnd, selectionStart, value } = current;

      prevInputStateRef.current = { selectionEnd, selectionStart, value };
    }
  }, [inputElementRef, prevInputStateRef]);

  // This is for moving the selection while setting the send box value.
  // If we only use setSendBox, we will need to wait for the next render cycle to get the value in, before we can set selectionEnd/Start.
  const setSelectionRangeAndValue = useCallback(
    ({ selectionEnd, selectionStart, value }) => {
      if (inputElementRef.current) {
        // We need to set the value, before selectionStart/selectionEnd.
        inputElementRef.current.value = value;

        inputElementRef.current.selectionStart = selectionStart;
        inputElementRef.current.selectionEnd = selectionEnd;
      }

      onChange?.(value);
    },
    [inputElementRef, onChange]
  );

  const setTextBoxValue = useCallback<(selctionAndValue: SelectionAndValue) => SelectionAndValue>(
    (
      { selectionEnd: nextSelectionEnd, selectionStart: nextSelectionStart, value: nextValue } = {
        selectionEnd: undefined,
        selectionStart: undefined,
        value: ''
      }
    ) => {
      // Currently, we cannot detect whether the change is due to clipboard paste or pressing a key on the keyboard.
      // We should not change to emoji when the user is pasting text.
      // We would assume, for a single character addition, the user must be pressing a key.

      if (nextValue.length === value.length + 1) {
        ({
          selectionEnd: nextSelectionEnd,
          selectionStart: nextSelectionStart,
          value: nextValue
        } = replaceEmoticon({ selectionEnd: nextSelectionEnd, selectionStart: nextSelectionStart, value: nextValue }));
      }

      setSelectionRangeAndValue({
        selectionEnd: nextSelectionEnd,
        selectionStart: nextSelectionStart,
        value: nextValue
      });

      onChange?.(nextValue);

      return {
        selectionEnd: nextSelectionEnd,
        selectionStart: nextSelectionStart,
        value: nextValue
      };
    },
    [onChange, replaceEmoticon, setSelectionRangeAndValue, value]
  );

  const handleChange = useCallback<FormEventHandler<H>>(
    ({ currentTarget: { selectionEnd, selectionStart, value } }) => {
      if (placeCheckpointOnChangeRef.current) {
        undoStackRef.current.push({ ...prevInputStateRef.current });

        placeCheckpointOnChangeRef.current = false;
      }

      const nextInputState = setTextBoxValue({ selectionEnd, selectionStart, value });

      // If an emoticon is converted to emoji, place another checkpoint.
      if (nextInputState.value !== value) {
        undoStackRef.current.push({ selectionEnd, selectionStart, value });

        placeCheckpointOnChangeRef.current = true;

        setSelectionRangeAndValue(nextInputState);
      }
    },
    [placeCheckpointOnChangeRef, prevInputStateRef, setSelectionRangeAndValue, setTextBoxValue, undoStackRef]
  );

  const handleFocus = useCallback(() => {
    rememberInputState();

    placeCheckpointOnChangeRef.current = true;
  }, [placeCheckpointOnChangeRef, rememberInputState]);

  const handleKeyDown = useCallback(
    event => {
      const { ctrlKey, key, metaKey } = event;

      if ((ctrlKey || metaKey) && (key === 'Z' || key === 'z')) {
        event.preventDefault();

        const poppedInputState = undoStackRef.current.pop();

        if (poppedInputState) {
          prevInputStateRef.current = { ...poppedInputState };
        } else {
          prevInputStateRef.current = { selectionEnd: 0, selectionStart: 0, value: '' };
        }

        setSelectionRangeAndValue(prevInputStateRef.current);
      }
    },
    [prevInputStateRef, setSelectionRangeAndValue, undoStackRef]
  );

  const handleSelect = useCallback<ReactEventHandler<H>>(
    ({ currentTarget: { selectionEnd, selectionStart, value } }) => {
      if (value === prevInputStateRef.current.value) {
        // When caret move, we should push to undo stack on change.
        placeCheckpointOnChangeRef.current = true;
      }

      prevInputStateRef.current = { selectionEnd, selectionStart, value };
    },
    [placeCheckpointOnChangeRef, prevInputStateRef]
  );

  // This is for TypeFocusSink. When the focus in on the script, then starting press "a", without this line, it would cause errors.
  // We call rememberInputState() when "onFocus" event is fired, but since this is from TypeFocusSink, we are not able to receive "onFocus" event before it happen.
  useEffect(rememberInputState, [rememberInputState]);

  return React.createElement(componentType, {
    onChange: handleChange,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    onSelect: handleSelect,
    ref: inputElementRef,
    value
  });
}

// TODO: Can we use react-wrap-with?
export default function withEmoji<
  H extends SupportedHTMLElement,
  T extends ComponentType<RequiredProps<H>> = ComponentType<RequiredProps<H>>
>(componentType: T): ComponentType<Omit<WithEmojiProps<H>, 'componentType'>> {
  const WithEmoji = ({ onChange, value }: Omit<WithEmojiProps<H>, 'componentType'>) => (
    <WithEmojiController<H> componentType={componentType} onChange={onChange} value={value} />
  );

  WithEmoji.displayName = `WithEmoji<${componentType.displayName}>`;

  return WithEmoji;
}
