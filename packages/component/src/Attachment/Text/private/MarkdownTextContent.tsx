import { hooks } from 'botframework-webchat-api';
import {
  parseClaim,
  parseCreativeWork,
  parseThing,
  type OrgSchemaClaim2,
  type WebChatActivity
} from 'botframework-webchat-core';
import classNames from 'classnames';
import type { Definition } from 'mdast';
// @ts-expect-error TS1479 should be fixed when bumping to typescript@5.
import { fromMarkdown } from 'mdast-util-from-markdown';
import React, { memo, useCallback, useMemo, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';

import { LinkDefinitionItem, LinkDefinitions } from '../../../LinkDefinition/index';
import useRenderMarkdownAsHTML from '../../../hooks/useRenderMarkdownAsHTML';
import useStyleSet from '../../../hooks/useStyleSet';
import useShowModal from '../../../providers/ModalDialog/useShowModal';
import CitationModalContext from './CitationModalContent';
import isHTMLButtonElement from './isHTMLButtonElement';

const { useLocalizer } = hooks;

type Entry = {
  claim: OrgSchemaClaim2;
  handleClick?: (() => void) | undefined;
  id: string;
  markdownDefinition?: Definition | undefined;
};

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
  // const claims = useMemo<readonly OrgSchemaClaim[]>(
  //   () =>
  //     Object.freeze(
  //       (entities || []).filter<OrgSchemaAsEntity<OrgSchemaClaim>>(
  //         (entity): entity is OrgSchemaAsEntity<OrgSchemaClaim> =>
  //           isOrgSchemaThingAsEntity(entity) && isOrgSchemaThingOf<OrgSchemaClaim>(entity, 'Claim')
  //       )
  //     ),
  //   [entities]
  // );
  const currentMessage = useMemo(() => {
    const messageEntity = (entities || []).find(entity => {
      const isThing = entity.type?.startsWith('https://schema.org/');

      if (isThing) {
        const thing = parseThing(entity);

        return thing['@id'] === '';
      }
    });

    const message = messageEntity && parseCreativeWork(messageEntity);

    return message && parseCreativeWork(message);
  }, [entities]);
  const localize = useLocalizer();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const showModal = useShowModal();

  const citationModalDialogLabel = localize('CITATION_MODEL_DIALOG_ALT');

  if (!renderMarkdownAsHTML) {
    throw new Error('botframework-webchat: assert failed for renderMarkdownAsHTML');
  }

  const dangerouslySetInnerHTML = useMemo(
    () => ({ __html: markdown ? renderMarkdownAsHTML(markdown) : '' }),
    [renderMarkdownAsHTML, markdown]
  );

  const markdownDefinitions = useMemo(
    () => fromMarkdown(markdown).children.filter((node): node is Definition => node.type === 'definition'),
    [markdown]
  );

  const showClaimModal = useCallback(
    (title, text, altText) => {
      showModal(() => <CitationModalContext headerText={title} markdown={text} />, {
        'aria-label': altText || title || citationModalDialogLabel,
        className: classNames('webchat__citation-modal-dialog', citationModalDialogStyleSet)
      });
    },
    [citationModalDialogStyleSet, citationModalDialogLabel, showModal]
  );

  const entries = useMemo<readonly Entry[]>(
    () =>
      Object.freeze(
        (currentMessage?.citation || []).map(parseClaim).map<Entry>(claim => {
          const markdownDefinition = markdownDefinitions.find(({ url }) => url === claim['@id']);

          return {
            claim,
            id: claim['@id'],
            markdownDefinition,
            handleClick: claim.appearance?.url
              ? undefined
              : () => showClaimModal(markdownDefinition.title, claim.appearance?.text, claim.alternateName)
          };
        }) || []
      ),
    [currentMessage, markdownDefinitions, showClaimModal]
  );

  const entriesRef = useRefFrom(entries);

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

      const entry = entriesRef.current.find(({ claim: { '@id': id } }) => id === buttonElement.value);

      if (entry?.handleClick) {
        event.preventDefault();
        event.stopPropagation();

        entry.handleClick();
      }
    },
    [entriesRef]
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
      {!!entries.length && (
        <LinkDefinitions>
          {entries.map(entry => (
            <LinkDefinitionItem
              badgeText={entry.claim.appearance?.usageInfo?.name}
              badgeTooltip={entry.claim.appearance?.usageInfo?.description}
              identifier={entry.markdownDefinition?.identifier}
              key={entry.claim['@id']}
              onClick={entry.handleClick}
              text={entry.markdownDefinition?.title}
              url={entry.claim.appearance?.url}
            />
          ))}
        </LinkDefinitions>
      )}
    </div>
  );
});

MarkdownTextContent.displayName = 'MarkdownTextContent';

export default MarkdownTextContent;
