/* eslint react/no-danger: "off" */

import { onErrorResumeNext } from 'botframework-webchat-core';
import { hooks } from 'botframework-webchat-api';
import React, { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import betterLinks, { type BetterLinkEnv, type LinkOptions } from './betterLinks';

const allowedSchemes = ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'];

const linkDefinitions = [];

const externalLinkAlt = '';

const defaultDecorateLink = (href: string, textContent: string, linkOptions?: LinkOptions): LinkOptions | undefined => {
  const decoration: LinkOptions = {
    rel: 'noopener noreferrer',
    target: '_blank',
    wrapZeroWidthSpace: true,
    ...linkOptions
  };

  const ariaLabelSegments: string[] = [textContent];
  const classes: Set<string> = new Set();
  const linkDefinition = linkDefinitions.find(({ url }) => url === href);
  const protocol = onErrorResumeNext(() => new URL(href).protocol);

  if (linkDefinition) {
    ariaLabelSegments.push(
      linkDefinition.title || onErrorResumeNext(() => new URL(linkDefinition.url).host) || linkDefinition.url
    );

    // linkDefinition.identifier is uppercase, while linkDefinition.label is as-is.
    linkDefinition.label === textContent && classes.add('webchat__render-markdown__pure-identifier');
  }

  // For links that would be sanitized out, let's turn them into a button so we could handle them later.
  if (!allowedSchemes.map(scheme => `${scheme}:`).includes(protocol)) {
    decoration.asButton ??= true;

    classes.add('webchat__render-markdown__citation');
  } else if (protocol === 'http:' || protocol === 'https:') {
    decoration.iconClassName = [decoration.iconClassName, 'webchat__render-markdown__external-link-icon']
      .filter((className: string | undefined) => className)
      .join(' ');

    ariaLabelSegments.push(externalLinkAlt);
  }

  // The first segment is textContent. Putting textContent is aria-label is useless.
  if (ariaLabelSegments.length > 1) {
    // If "aria-label" is already applied, do not overwrite it.
    decoration.ariaLabel ??= (value: string) => value || ariaLabelSegments.join(' ');
  }

  if (typeof linkOptions?.className === 'string') {
    classes.add(linkOptions.className);
  }

  // Resolve className
  const classNamesString = Array.from(classes).join(' ');
  if (linkOptions?.className && linkOptions?.className instanceof Function) {
    decoration.className = linkOptions.className(classNamesString);
  } else {
    decoration.className = classNamesString;
  }

  // By default, Markdown-It will set "title" to the link title in link definition.

  // However, "title" may be narrated by screen reader:
  // - Edge
  //   - <a> will narrate "aria-label" but not "title"
  //   - <button> will narrate both "aria-label" and "title"
  // - NVDA
  //   - <a> will narrate both "aria-label" and "title"
  //   - <button> will narrate both "aria-label" and "title"

  // Title makes it very difficult to control narrations by the screen reader. Thus, we are disabling it in favor of "aria-label".
  // This will not affect our accessibility compliance but UX. We could use a non-native tooltip or other forms of visual hint.

  decoration.title ??= false;

  return decoration;
};

const { useLocalizer } = hooks;

type Plural = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

const markdownIt = new MarkdownIt().use(betterLinks);

const LocalizedString = ({
  className,
  stringId,
  stringIds,
  count,
  linkClassName,
  onDecorateLink = defaultDecorateLink
}: Readonly<{
  className?: string | undefined;
  stringId?: string | undefined;
  stringIds?: Plural | undefined;
  count?: number | undefined;
  linkClassName?: string | undefined;
  onDecorateLink?: (href: string, textContent: string) => LinkOptions | undefined;
}>) => {
  const localize = useLocalizer(stringIds && { plural: true });
  const env = useMemo<BetterLinkEnv>(
    () => ({
      linkOptions: {
        className: linkClassName
      },
      decorateLink: onDecorateLink
    }),
    [linkClassName, onDecorateLink]
  );

  const html = useMemo(
    () => ({
      __html: markdownIt.renderer.render(markdownIt.parseInline(localize(stringId ?? stringIds ?? '', count), env), env)
    }),
    [count, env, localize, stringId, stringIds]
  );

  return <span className={className} dangerouslySetInnerHTML={html} />;
};

export default LocalizedString;
