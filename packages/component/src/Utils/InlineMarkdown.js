/* eslint react/no-danger: "off" */

import { css } from 'glamor';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import updateIn from 'simple-update-in';

import createCustomEvent from '../Utils/createCustomEvent';
import randomId from './randomId';
import useInternalMarkdownIt from '../hooks/internal/useInternalMarkdownIt';
import useStyleOptions from '../hooks/useStyleOptions';
import walkMarkdownTokens from './walkMarkdownTokens';

function replaceAnchorWithButton(markdownTokens) {
  return walkMarkdownTokens(markdownTokens, markdownToken => {
    markdownToken = { ...markdownToken };

    switch (markdownToken.type) {
      case 'link_open':
        markdownToken.tag = 'button';
        markdownToken.attrs = [
          ...updateIn(
            markdownToken.attrs,
            [([name, value]) => name === 'href' && value.startsWith('#')],
            ([, value]) => ['data-markdown-href', value.substr(1)]
          ),
          ['type', 'button']
        ];
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

const InlineMarkdown = ({ children, onReference, references }) => {
  if (typeof children !== 'string') {
    console.warn('botframework-webchat: "children" prop passed to <InlineMarkdown> must be of type string.');
    children = '';
  }

  const [markdownIt] = useInternalMarkdownIt();
  const [{ accent }] = useStyleOptions();

  // We inlined the style here because this style is:
  // 1. Internal to Web Chat
  // 2. Not customizable from developers (other than setting `styleOptions.accent`)
  const className = useMemo(
    () =>
      css({
        '& button[data-markdown-href]': {
          appearance: 'none',
          backgroundColor: 'transparent',
          border: 0,
          color: accent,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          padding: 0
        }
      }) + '',
    [accent]
  );

  // Markdown-It only support references in uppercase.
  references = references.map(reference => reference.toUpperCase());

  const { hrefToRef, refToHref } = references.reduce(
    ({ hrefToRef, refToHref }, ref) => {
      const href = randomId();

      return {
        hrefToRef: { ...hrefToRef, [href]: ref },
        refToHref: { ...refToHref, [ref]: href }
      };
    },
    { hrefToRef: {}, refToHref: {} }
  );

  const html = useMemo(() => {
    const tree = markdownIt.parseInline(children, {
      references: references.reduce(
        // (references, key) => ({ ...references, [key]: { href: `#${key}` } }),
        (references, key) => ({ ...references, [key]: { href: `#${refToHref[key]}` } }),
        {}
      )
    });

    // Turn "<a href="#retry">Retry</a>" into "<button data-ref="retry" type="button">Retry</button>"
    const updatedTree = replaceAnchorWithButton(tree);

    return { __html: markdownIt.renderer.render(updatedTree) };
  }, [children, refToHref, markdownIt, references]);

  const handleClick = useCallback(
    event => {
      event.stopPropagation();

      const href = event.target.getAttribute('data-markdown-href');

      href && onReference && onReference(createCustomEvent('reference', { data: hrefToRef[href] }));
    },
    [hrefToRef, onReference]
  );

  return <span className={className} dangerouslySetInnerHTML={html} onClick={handleClick} />;
};

InlineMarkdown.defaultProps = {
  children: '',
  onReference: undefined,
  references: []
};

InlineMarkdown.propTypes = {
  children: PropTypes.string,
  onReference: PropTypes.func,
  references: PropTypes.arrayOf(PropTypes.string)
};

export default InlineMarkdown;
