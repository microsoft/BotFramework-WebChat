// The content rendered here is sanitized.
/* eslint react/no-danger: "off" */
/* eslint react/no-array-index-key: "off" */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';
import useRenderMarkdown from '../hooks/useRenderMarkdown';
import useStyleSet from '../hooks/useStyleSet';

const TextContent = ({ contentType, text }) => {
  const renderMarkdown = useRenderMarkdown();
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
  contentType: 'text/markdown'
};

TextContent.propTypes = {
  contentType: PropTypes.string,
  text: PropTypes.string.isRequired
};

export default TextContent;
