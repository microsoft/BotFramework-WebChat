// The content rendered here is sanitized.
/* eslint react/no-danger: "off" */
/* eslint react/no-array-index-key: "off" */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const TextContent = ({ contentType, renderMarkdown, styleSet, text }) =>
  contentType === 'text/markdown' && renderMarkdown ? (
    <div
      className={classNames('markdown', styleSet.textContent + '')}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(text || '') }}
    />
  ) : (
    (text || '').split('\n').map((line, index) => (
      <p className={classNames('plain', styleSet.textContent + '')} key={index}>
        {line.trim()}
      </p>
    ))
  );

TextContent.defaultProps = {
  contentType: 'text/markdown',
  renderMarkdown: text => text
};

TextContent.propTypes = {
  contentType: PropTypes.string,
  renderMarkdown: PropTypes.func,
  styleSet: PropTypes.shape({
    textContent: PropTypes.any.isRequired
  }).isRequired,
  text: PropTypes.string.isRequired
};

export default connectToWebChat(({ renderMarkdown, styleSet }) => ({ renderMarkdown, styleSet }))(TextContent);
