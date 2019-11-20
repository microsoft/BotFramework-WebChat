/* eslint react/no-danger: "off" */
/* eslint react/no-array-index-key: "off" */

// The content rendered here is sanitized.

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import remarkStripMarkdown from '../Utils/remarkStripMarkdown';

import ScreenReaderText from '../ScreenReaderText';
import useRenderMarkdownAsHTML from '../hooks/useRenderMarkdownAsHTML';
import useStyleSet from '../hooks/useStyleSet';

const TextContent = ({ contentType, text }) => {
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const [{ textContent: textContentStyleSet }] = useStyleSet();
  const strippedText = remarkStripMarkdown(text).contents;

  return contentType === 'text/markdown' && renderMarkdownAsHTML ? (
    <React.Fragment>
      <ScreenReaderText text={strippedText} />
      <div
        aria-hidden={true}
        className={classNames('markdown', textContentStyleSet + '')}
        dangerouslySetInnerHTML={{ __html: renderMarkdownAsHTML(text || '') }}
      />
    </React.Fragment>
  ) : (
    (text || '').split('\n').map((line, index) => (
      <React.Fragment key={index}>
        <ScreenReaderText text={remarkStripMarkdown(line.trim()).contents} />
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
