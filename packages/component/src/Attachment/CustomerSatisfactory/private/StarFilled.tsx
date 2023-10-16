import React from 'react';

type Props = Readonly<{ className?: string }>;

const StarFilled = ({ className }: Props) => (
  <svg
    className={className}
    fill="none"
    height="32"
    role="presentation"
    viewBox="0 0 32 32"
    width="32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.8059 6.53191C15.295 5.54091 16.7081 5.54092 17.1972 6.53191L19.7711 11.7472L25.5266 12.5836C26.6202 12.7425 27.0569 14.0864 26.2656 14.8578L22.1009 18.9174L23.084 24.6496C23.2708 25.7388 22.1276 26.5694 21.1494 26.0552L16.0016 23.3488L10.8537 26.0552C9.87557 26.5694 8.73233 25.7388 8.91914 24.6496L9.90229 18.9174L5.7376 14.8578C4.94625 14.0864 5.38293 12.7425 6.47656 12.5836L12.232 11.7472L14.8059 6.53191Z"
      fill="currentColor"
    />
  </svg>
);

export default StarFilled;
