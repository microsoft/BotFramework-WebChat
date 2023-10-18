import { hooks } from 'botframework-webchat-api';
import { useRefFrom } from 'use-ref-from';
import classNames from 'classnames';
import React, { memo, type MouseEventHandler, useCallback, useMemo } from 'react';

import { type PropsOf } from '../../../types/PropsOf';
import {
  isOrgSchemaThingAsEntity,
  isOrgSchemaThingOf,
  type OrgSchemaAsEntity,
  type OrgSchemaClaim,
  type WebChatActivity
} from 'botframework-webchat-core';
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
  const claims = useMemo<readonly OrgSchemaClaim[]>(
    () =>
      Object.freeze(
        (entities || []).filter<OrgSchemaAsEntity<OrgSchemaClaim>>(
          (entity): entity is OrgSchemaAsEntity<OrgSchemaClaim> =>
            isOrgSchemaThingAsEntity(entity) && isOrgSchemaThingOf<OrgSchemaClaim>(entity, 'Claim')
        )
      ),
    [entities]
  );
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const showModal = useShowModal();

  const claimsRef = useRefFrom(claims);
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
    (claim: OrgSchemaClaim) => {
      showModal(() => <CitationModalContext headerText={claim.name} markdown={claim.text} />, {
        'aria-label': claim.alternateName || claim.name || citationModalDialogLabel,
        className: classNames('webchat__citation-modal-dialog', citationModalDialogStyleSet)
      });
    },
    [citationModalDialogStyleSet, citationModalDialogLabel, showModal]
  );

  const handleCitationClick = useCallback<PropsOf<typeof LinkDefinitions>['onCitationClick']>(
    url => {
      const claim = claimsRef.current.find(({ '@id': id }) => id === url);

      claim && showClaimModal(claim);
    },
    [claimsRef, showClaimModal]
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

      const claim = claimsRef.current.find(({ '@id': id }) => id === buttonElement.value);

      if (!claim) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      showClaimModal(claim);
    },
    [claimsRef, showClaimModal]
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
