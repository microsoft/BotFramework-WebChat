// The content rendered here is sanitized.
/* eslint react/no-danger: "off" */
/* eslint react/no-array-index-key: "off" */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';

const TextContent = ({ contentType, renderMarkdown, styleSet, text }) =>
  contentType === 'text/markdown' && renderMarkdown ? (
    <React.Fragment>
      <ScreenReaderText text={text} />
      <div
        aria-hidden={true}
        className={classNames('markdown', styleSet.textContent + '')}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(text || '') }}
      />
    </React.Fragment>
  ) : (
    (text || '').split('\n').map((line, index) => (
      <React.Fragment key={index}>
        <ScreenReaderText text={text} />
        <p aria-hidden={true} className={classNames('plain', styleSet.textContent + '')}>
          {line.trim()}
        </p>
      </React.Fragment>
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
