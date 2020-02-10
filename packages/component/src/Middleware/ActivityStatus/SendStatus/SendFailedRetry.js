/* eslint react/no-danger: "off" */

import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import updateIn from 'simple-update-in';

import useInternalMarkdownIt from '../../../hooks/internal/useInternalMarkdownIt';
import useLocalizeCallback from '../../../hooks/useLocalizeCallback';
import walkMarkdownTokens from '../../../Utils/walkMarkdownTokens';

function walkMarkdownTokens(tokens, walker) {
  return tokens.map(token => {
    if (token) {
      const nextToken = walker(token);

      if (nextToken.children) {
        nextToken.children = walkMarkdownTokens(nextToken.children, walker);
      }

      return nextToken;
    }

    return token;
  });
}

function replaceAnchorWithButton(markdownTokens) {
  return walkMarkdownTokens(markdownTokens, markdownToken => {
    markdownToken = { ...markdownToken };

    switch (markdownToken.type) {
      case 'link_open':
        markdownToken.tag = 'button';
        markdownToken.attrs = updateIn(markdownToken.attrs, [([name]) => name === 'href'], ([, value]) => [
          'data-ref',
          value
        ]);
        break;

      case 'link_close':
        markdownToken.tag = 'button';
        break;

      default:
        break;
    }

    return markdownToken;
  });
}

const SendFailedRetry = ({ onRetryClick }) => {
  const localize = useLocalizeCallback();

  const sendFailedText = localize('ACTIVITY_STATUS_SEND_FAILED_RETRY');

  const [markdownIt] = useInternalMarkdownIt();
  const html = useMemo(() => {
    const tree = markdownIt.parseInline(sendFailedText, { references: { RETRY: { href: '#retry' } } });

    // Turn "<a href="#retry">Retry</a>" into "<button data-ref="#retry">Retry</button>"
    const updatedTree = replaceAnchorWithButton(tree);

    return { __html: markdownIt.renderer.render(updatedTree) };
  }, [markdownIt, sendFailedText]);

  const handleClick = useCallback(
    event => {
      event.stopPropagation();
      event.target.getAttribute('data-ref') === '#retry' && onRetryClick();
    },
    [onRetryClick]
  );

  return <span dangerouslySetInnerHTML={html} onClick={handleClick} />;
};

SendFailedRetry.propTypes = {
  onRetryClick: PropTypes.func.isRequired
};

export default SendFailedRetry;
