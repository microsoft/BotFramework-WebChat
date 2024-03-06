import React, { memo } from 'react';

const Chevron = memo(() => (
  <svg
    className="webchat__link-definitions__header-chevron"
    fill="none"
    height="10"
    viewBox="1 3 10 7"
    width="14"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.14645 4.64645C2.34171 4.45118 2.65829 4.45118 2.85355 4.64645L6 7.79289L9.14645 4.64645C9.34171 4.45118 9.65829 4.45118 9.85355 4.64645C10.0488 4.84171 10.0488 5.15829 9.85355 5.35355L6.35355 8.85355C6.15829 9.04882 5.84171 9.04882 5.64645 8.85355L2.14645 5.35355C1.95118 5.15829 1.95118 4.84171 2.14645 4.64645Z"
      fill="currentcolor"
    />
  </svg>
));

Chevron.displayName = 'Chevron';

export default Chevron;
