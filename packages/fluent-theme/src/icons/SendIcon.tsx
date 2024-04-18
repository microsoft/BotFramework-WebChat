import React from 'react';

export function SendIcon(props: Readonly<{ readonly className?: string }>) {
  return (
    <svg
      aria-hidden="true"
      className={props.className}
      fill="currentColor"
      height="1em"
      viewBox="0 0 20 20"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.18 2.11a.5.5 0 0 1 .54-.06l15 7.5a.5.5 0 0 1 0 .9l-15 7.5a.5.5 0 0 1-.7-.58L3.98 10 2.02 2.63a.5.5 0 0 1 .16-.52Zm2.7 8.39-1.61 6.06L16.38 10 3.27 3.44 4.88 9.5h6.62a.5.5 0 1 1 0 1H4.88Z"
        fill="currentColor"
      />
    </svg>
  );
}
