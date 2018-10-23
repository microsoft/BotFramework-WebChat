import classNames from 'classnames';
import React from 'react';

import connectWithContext from '../connectWithContext';

export default connectWithContext(
  ({ renderMarkdown, styleSet }) => ({ renderMarkdown, styleSet })
)(
  ({
    contentType = 'text/markdown',
    renderMarkdown,
    styleSet,
    text
  }) =>
    (contentType === 'text/markdown' && renderMarkdown) ?
      <div
        className={ classNames('markdown', styleSet.textContent + '') }
        dangerouslySetInnerHTML={{ __html: renderMarkdown(text || '') }}
      />
    :
      (text || '').split('\n').map((line, index) =>
        <p
          className={ classNames('plain', styleSet.textContent + '') }
          key={ index }
        >
          { line.trim() }
        </p>
      )
)
