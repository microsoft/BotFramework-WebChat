import React, { forwardRef, useState } from 'react';
import withEmoji, { type RequiredProps } from './withEmoji';

const TextInput = forwardRef<HTMLInputElement>(
  // eslint-disable-next-line react/prop-types
  ({ onChange, onFocus, onKeyDown, onSelect, value }: RequiredProps<HTMLInputElement>, ref) => (
    <input
      onChange={onChange}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onSelect={onSelect}
      ref={ref}
      type="text"
      value={value}
    />
  )
);

TextInput.displayName = 'TextInput';

const TextInputWithEmoji = withEmoji<HTMLInputElement>(TextInput);

const SendBox = () => {
  const [value, setValue] = useState<string>('Hello, World!');

  return <TextInputWithEmoji onChange={setValue} value={value} />;
};

SendBox.displayName = 'SendBox';

export default SendBox;
