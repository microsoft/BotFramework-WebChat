// The content rendered here is sanitized.
/* eslint react/no-danger: "off" */
/* eslint react/no-array-index-key: "off" */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';
import useWebChat from '../useWebChat';
import useStyleSet from '../hooks/useStyleSet';

const useTextContext = () => useWebChat(({ renderMarkdown = text => text }) => ({ renderMarkdown }));

const TextContent = ({ contentType, text }) => {
  const { renderMarkdown } = useTextContext();
  const styleSet = useStyleSet();

  return contentType === 'text/markdown' && renderMarkdown ? (
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
};

TextContent.defaultProps = {
  contentType: 'text/markdown'
};

TextContent.propTypes = {
  contentType: PropTypes.string,
  text: PropTypes.string.isRequired
};

export default TextContent;

export { useTextContext };
