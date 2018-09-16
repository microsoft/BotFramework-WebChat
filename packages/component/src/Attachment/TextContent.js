import classNames from 'classnames';
import React from 'react';

import Context from '../Context';

export default ({
  contentType = 'text/markdown',
  text
}) =>
  <Context.Consumer>
    { ({ renderMarkdown, styleSet }) =>
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
    }
  </Context.Consumer>
