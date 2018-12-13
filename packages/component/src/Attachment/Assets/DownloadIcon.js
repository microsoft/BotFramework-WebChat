import React from 'react';

import { localize } from '../../Localization/Localize';

export default ({ className, language, size = 1 }) =>
  <svg
    aria-label={ localize('Download file', language) }
    className={ className }
    height={ 20 * size }
    viewBox="0 0 12 20"
    width={ 12 * size }
  >
    <path
      d="M.435 20v-1.25h11.13V20H.435zM12 10.44l-6 6.113-6-6.114.87-.88 4.512 4.59V0h1.236v14.15l4.512-4.59.87.88z"
      fillRule="evenodd"
    />
  </svg>
