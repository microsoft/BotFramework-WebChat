import { hooks } from 'botframework-webchat-api';
import { useRefFrom } from 'use-ref-from';
import classNames from 'classnames';
import React, { memo, type MouseEventHandler, useCallback, useMemo } from 'react';

import { isClaim, type Claim } from '../../../types/external/OrgSchema/Claim';
import { isThing } from '../../../types/external/OrgSchema/Thing';
import { type PropsOf } from '../../../types/PropsOf';
import { type WebChatActivity } from 'botframework-webchat-core';
import CitationModalContext from './CitationModalContent';
import isHTMLButtonElement from './isHTMLButtonElement';
import LinkDefinitions from './LinkDefinitions';
import useRenderMarkdownAsHTML from '../../../hooks/useRenderMarkdownAsHTML';
import useShowModal from '../../../providers/ModalDialog/useShowModal';
import useStyleSet from '../../../hooks/useStyleSet';

const { useLocalizer } = hooks;

type Props = Readonly<{
  entities?: WebChatActivity['entities'];
  markdown: string;
}>;

const MarkdownTextContent = memo(({ entities, markdown }: Props) => {
  const [
    {
      citationModalDialog: citationModalDialogStyleSet,
      renderMarkdown: renderMarkdownStyleSet,
      textContent: textContentStyleSet
    }
  ] = useStyleSet();
  const entitiesRef = useRefFrom(entities);
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const showModal = useShowModal();

  const localize = useLocalizer();

  const citationModalDialogLabel = localize('CITATION_MODEL_DIALOG_ALT');

  if (!renderMarkdownAsHTML) {
    throw new Error('botframework-webchat: assert failed for renderMarkdownAsHTML');
  }

  const dangerouslySetInnerHTML = useMemo(
    () => ({ __html: markdown ? renderMarkdownAsHTML(markdown) : '' }),
    [renderMarkdownAsHTML, markdown]
  );

  const showClaimModal = useCallback(
    (claim: Claim) => {
      showModal(() => <CitationModalContext headerText={claim.name} markdown={claim.text} />, {
        'aria-label': claim.alternateName || claim.name || citationModalDialogLabel,
        className: classNames('webchat__citation-modal-dialog', citationModalDialogStyleSet)
      });
    },
    [citationModalDialogStyleSet, citationModalDialogLabel, showModal]
  );

  const handleCitationClick = useCallback<PropsOf<typeof LinkDefinitions>['onCitationClick']>(
    url => {
      const claim = entities.find<Claim>(
        (entity): entity is Claim => isThing(entity) && isClaim(entity) && entity['@id'] === url
      );

      claim && showClaimModal(claim);
    },
    [entities, showClaimModal]
  );

  const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    event => {
      // Find out what <button> is being clicked.
      const targetElement = event.target as HTMLElement;
      const buttonElement: HTMLButtonElement | undefined = isHTMLButtonElement(targetElement)
        ? targetElement
        : (targetElement.closest('button') as HTMLButtonElement | undefined);

      if (!buttonElement || !targetElement.contains(buttonElement)) {
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
      <LinkDefinitions markdown={markdown} onCitationClick={handleCitationClick} />
    </div>
  );
});

MarkdownTextContent.displayName = 'MarkdownTextContent';

export default MarkdownTextContent;
