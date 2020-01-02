import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import updateIn from 'simple-update-in';

import MarkdownIt from '../../../../../bundle/node_modules/markdown-it';
import useLocalize from '../../../hooks/useLocalize';

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
    }

    return markdownToken;
  });
}

const SendFailedRetry = ({ onRetryClick }) => {
  const sendFailedText = useLocalize('SEND_FAILED_KEY');

  const markdown = useMemo(() => new MarkdownIt());
  const html = useMemo(() => {
    const tree = markdown.parseInline(sendFailedText, { references: { RETRY: { href: '#retry' } } });
    const updatedTree = replaceAnchorWithButton(tree);

    return { __html: markdown.renderer.render(updatedTree) };
  }, [sendFailedText]);

  const handleClick = useCallback(event => {
    event.target.getAttribute('data-ref') === '#retry' && onRetryClick();
  }, []);

  return <span dangerouslySetInnerHTML={html} onClick={handleClick} />;
};

SendFailedRetry.propTypes = {
  onRetryClick: PropTypes.func.isRequired
};

export default SendFailedRetry;
