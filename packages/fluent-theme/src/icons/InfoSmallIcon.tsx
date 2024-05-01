import React, { memo } from 'react';

function InfoSmallIcon(props: Readonly<{ readonly className?: string }>) {
  return (
    <svg
      aria-hidden="true"
      className={props.className}
      height="1em"
      viewBox="0 0 16 16"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 7.5a.5.5 0 1 0-1 0v3a.5.5 0 0 0 1 0v-3Zm.25-2a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default memo(InfoSmallIcon);
