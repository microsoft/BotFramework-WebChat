import { useRefFrom } from 'use-ref-from';
import classNames from 'classnames';
import React, { memo, type MouseEventHandler, useCallback, useMemo } from 'react';

import getClaimsFromMarkdown from './private/getClaimsFromMarkdown';
import isHTMLButtonElement from './private/isHTMLButtonElement';
import LinkDefinitions from './private/ui/LinkDefinitions';
import useRenderMarkdownAsHTML from '../../hooks/useRenderMarkdownAsHTML';
import useShowModal from '../../providers/ModalDialog/useShowModal';
import useStyleSet from '../../hooks/useStyleSet';

import { hasText, isClaim, type Claim } from '../../types/external/SchemaOrg/Claim';
import { isThing } from '../../types/external/SchemaOrg/Thing';

import { type PropsOf } from '../../types/PropsOf';
import { type WebChatActivity } from 'botframework-webchat-core';

type Props = {
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  entities?: WebChatActivity['entities'];
  markdown: string;
};

const MarkdownTextContent = memo(({ entities, markdown }: Props) => {
  const [{ renderMarkdown: renderMarkdownStyleSet, textContent: textContentStyleSet }] = useStyleSet();
  const entitiesRef = useRefFrom(entities);
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  // const showCitationPopover = useShowCitationPopover();
  const showModal = useShowModal();

  if (!renderMarkdownAsHTML) {
    throw new Error('botframework-webchat: assert failed for renderMarkdownAsHTML');
  }

  // Citations are claim with text.
  // We are building a map for quick lookup.
  const citationMap = useMemo<Map<string, Claim & { text: string }>>(
    () =>
      (entities || []).reduce<Map<string, Claim & { text: string }>>((citationMap, entity) => {
        if (isThing(entity) && isClaim(entity) && hasText(entity) && entity['@id']) {
          return citationMap.set(entity['@id'], entity);
        }

        return citationMap;
      }, new Map()),
    [entities]
  );

  // These are all the claims, including citation (claim with text) and links (claim without text but URL).
  const claims = useMemo(
    () => Object.freeze(Array.from(getClaimsFromMarkdown(markdown, citationMap))),
    [citationMap, markdown]
  );

  // The content rendered by `renderMarkdownAsHTML` is sanitized.
  const dangerouslySetInnerHTML = useMemo(
    () => ({ __html: markdown ? renderMarkdownAsHTML(markdown) : '' }),
    [renderMarkdownAsHTML, markdown]
  );

  const showClaimModal = useCallback(
    (claim: Claim) => {
      showModal(
        () => {
          const dangerouslySetInnerHTML = { __html: renderMarkdownAsHTML(claim.text) };

          return (
            <div
              className={classNames('webchat__render-markdown', renderMarkdownStyleSet + '')}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={dangerouslySetInnerHTML}
            />
          );
        },
        { 'aria-label': claim.alternateName || claim.name }
      );
    },
    [renderMarkdownAsHTML, renderMarkdownStyleSet, showModal]
  );

  const handleCitationClick = useCallback<PropsOf<typeof LinkDefinitions>['onCitationClick']>(
    claim => showClaimModal(claim),
    [showClaimModal]
  );

  const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    event => {
      // Find out what <button> is being clicked.
      const targetElement = event.target as HTMLElement;
      const buttonElement: HTMLButtonElement | undefined = isHTMLButtonElement(targetElement)
        ? targetElement
        : (targetElement.closest('button') as HTMLButtonElement | undefined);

      if (!buttonElement) {
        return;
      }

      const claim = entitiesRef.current?.find<Claim>(
        (entity): entity is Claim => isThing(entity) && isClaim(entity) && entity['@id'] === buttonElement.value
      );

      if (!claim) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      showClaimModal(claim);
    },
    [entitiesRef, showClaimModal]
  );

  return (
    <div
      // TODO: Fix this class name.
      className={classNames('webchat__text-content', 'webchat__text-content--is-markdown', textContentStyleSet + '')}
    >
      <div
        className={classNames(
          'webchat__text-content__markdown',
          'webchat__render-markdown',
          renderMarkdownStyleSet + ''
        )}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        onClick={handleClick}
      />
      <LinkDefinitions claims={claims} onCitationClick={handleCitationClick} />
    </div>
  );
});

MarkdownTextContent.displayName = 'MarkdownTextContent';

export default MarkdownTextContent;
