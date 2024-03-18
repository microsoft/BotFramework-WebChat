import { hooks } from 'botframework-webchat-api';
import {
  getOrgSchemaMessage,
  onErrorResumeNext,
  parseClaim,
  type OrgSchemaClaim,
  type WebChatActivity
} from 'botframework-webchat-core';
import classNames from 'classnames';
import type { Definition } from 'mdast';
// @ts-expect-error TS1479 should be fixed when bumping to typescript@5.
import { fromMarkdown } from 'mdast-util-from-markdown';
import React, { memo, useCallback, useMemo, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';

import { LinkDefinitionItem, LinkDefinitions } from '../../../LinkDefinition/index';
import dereferenceBlankNodes from '../../../Utils/JSONLinkedData/dereferenceBlankNodes';
import useRenderMarkdownAsHTML from '../../../hooks/useRenderMarkdownAsHTML';
import useStyleSet from '../../../hooks/useStyleSet';
import useShowModal from '../../../providers/ModalDialog/useShowModal';
import { type PropsOf } from '../../../types/PropsOf';
import CitationModalContext from './CitationModalContent';
import MessageSensitivityLabel from './MessageSensitivityLabel';
import isHTMLButtonElement from './isHTMLButtonElement';

const { useLocalizer } = hooks;

type Entry = {
  claim?: OrgSchemaClaim | undefined;
  handleClick?: (() => void) | undefined;
  key: string;
  markdownDefinition: Definition;
  url?: string | undefined;
};

type Props = Readonly<{
  activity: WebChatActivity;
  markdown: string;
}>;

function isCitationURL(url: string): boolean {
  return onErrorResumeNext(() => new URL(url))?.protocol === 'cite:';
}

const MarkdownTextContent = memo(({ activity, markdown }: Props) => {
  const [
    {
      citationModalDialog: citationModalDialogStyleSet,
      renderMarkdown: renderMarkdownStyleSet,
      textContent: textContentStyleSet
    }
  ] = useStyleSet();
  const localize = useLocalizer();
  const graph = useMemo(() => dereferenceBlankNodes(activity.entities || []), [activity.entities]);
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const showModal = useShowModal();

  const messageThing = useMemo(() => getOrgSchemaMessage(graph), [graph]);

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
        markdownDefinitions.map<Entry>(markdownDefinition => {
          const messageCitation = messageThing?.citation
            ?.map(parseClaim)
            .find(({ '@id': id }) => id === markdownDefinition.url);

          if (messageCitation) {
            return {
              claim: messageCitation,
              key: markdownDefinition.url,
              handleClick:
                messageCitation?.appearance && !messageCitation.appearance.url
                  ? () =>
                      showClaimModal(
                        markdownDefinition.title,
                        messageCitation.appearance.text,
                        messageCitation.alternateName
                      )
                  : undefined,
              markdownDefinition,
              url: messageCitation?.appearance ? messageCitation.appearance.url : markdownDefinition.url
            };
          }

          const rootLevelClaim = graph
            .filter(({ type }) => type === 'https://schema.org/Claim')
            .map(parseClaim)
            .find(({ '@id': id }) => id === markdownDefinition.url);

          if (rootLevelClaim) {
            return {
              claim: rootLevelClaim,
              key: markdownDefinition.url,
              handleClick: isCitationURL(rootLevelClaim['@id'])
                ? () => showClaimModal(markdownDefinition.title, rootLevelClaim.text, rootLevelClaim.alternateName)
                : undefined,
              markdownDefinition
            };
          }

          return {
            key: markdownDefinition.url,
            markdownDefinition,
            url: markdownDefinition.url
          };
        })
      ),
    [graph, markdownDefinitions, messageThing, showClaimModal]
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

      const entry = entriesRef.current.find(({ key }) => key === buttonElement.value);

      if (entry?.handleClick) {
        event.preventDefault();
        event.stopPropagation();

        entry.handleClick();
      }
    },
    [entriesRef]
  );

  const messageSensitivityLabelProps = useMemo<PropsOf<typeof MessageSensitivityLabel> | undefined>(() => {
    const usageInfo = messageThing?.usageInfo;

    if (usageInfo) {
      const { pattern } = usageInfo;
      const encryptionStatus = usageInfo.keywords?.find(({ name }) => name === 'encryptionStatus')?.termCode;

      return {
        color:
          pattern &&
          pattern.inDefinedTermSet === 'https://www.w3.org/TR/css-color-4/' &&
          pattern.name === 'color' &&
          pattern.termCode,
        isEncrypted: encryptionStatus === 'encrypted',
        name: usageInfo.name,
        title: usageInfo.description
      };
    }
  }, [messageThing]);

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
        <LinkDefinitions
          accessoryComponentType={messageSensitivityLabelProps && MessageSensitivityLabel}
          accessoryProps={messageSensitivityLabelProps}
        >
          {entries.map(entry => (
            <LinkDefinitionItem
              badgeName={entry.claim?.appearance?.usageInfo?.name}
              badgeTitle={[entry.claim?.appearance?.usageInfo?.name, entry.claim?.appearance?.usageInfo?.description]
                .filter(Boolean)
                .join('\n\n')}
              identifier={entry.markdownDefinition.label}
              key={entry.key}
              onClick={entry.handleClick}
              text={entry.markdownDefinition.title}
              url={entry.url}
            />
          ))}
        </LinkDefinitions>
      )}
    </div>
  );
});

MarkdownTextContent.displayName = 'MarkdownTextContent';

export default MarkdownTextContent;
