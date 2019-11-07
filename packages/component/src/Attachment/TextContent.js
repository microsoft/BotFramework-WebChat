// The content rendered here is sanitized.
/* eslint react/no-danger: "off" */
/* eslint react/no-array-index-key: "off" */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import useStyleSet from '../hooks/useStyleSet';

const TextContent = ({ contentType, renderMarkdown, text }) => {
  const [{ textContent: textContentStyleSet }] = useStyleSet();

  return contentType === 'text/markdown' && renderMarkdown ? (
    <React.Fragment>
      <ScreenReaderText text={text} />
      <div
        aria-hidden={true}
        className={classNames('markdown', textContentStyleSet + '')}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(text || '') }}
      />
    </React.Fragment>
  ) : (
    (text || '').split('\n').map((line, index) => (
      <React.Fragment key={index}>
        <ScreenReaderText text={text} />
        <p aria-hidden={true} className={classNames('plain', textContentStyleSet + '')}>
          {line.trim()}
        </p>
      </React.Fragment>
    ))
  );
};

TextContent.defaultProps = {
  contentType: 'text/markdown',
  renderMarkdown: text => text
};

TextContent.propTypes = {
  contentType: PropTypes.string,
  renderMarkdown: PropTypes.func,
  text: PropTypes.string.isRequired
};

export default connectToWebChat(({ renderMarkdown }) => ({ renderMarkdown }))(TextContent);
