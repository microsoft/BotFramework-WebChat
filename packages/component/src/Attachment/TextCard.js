import React from 'react';
import SanitizedHTML from 'react-sanitized-html';

import Context from '../Context';

const ALLOWED_TAGS = [
  'a',
  'b',
  'blockquote',
  'br',
  'caption',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'nl',
  'ol',
  'p',
  'pre',
  'span',
  'strike',
  'strong',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul'
];

export default ({
  attachment: { content: { text } = {} },
  contentType = 'text/markdown'
}) =>
  <Context.Consumer>
    { ({ renderMarkdown, styleSet }) =>
      (contentType === 'text/markdown' && renderMarkdown) ?
        <SanitizedHTML
          allowedTags={ ALLOWED_TAGS }
          className={ styleSet.textCard + '' }
          html={ renderMarkdown(text || '') }
        />
      :
        <p>{ text }</p>
    }
  </Context.Consumer>
