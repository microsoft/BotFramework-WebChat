import { hooks } from 'botframework-webchat-api';
import { getOrgSchemaMessage, parseClaim, type OrgSchemaClaim2, type WebChatActivity } from 'botframework-webchat-core';
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
import { type PropsOf } from '../../../types/PropsOf';
import CitationModalContext from './CitationModalContent';
import MessageSensitivityLabel from './MessageSensitivityLabel';
import isHTMLButtonElement from './isHTMLButtonElement';

const { useLocalizer } = hooks;

type Entry = {
  claim?: OrgSchemaClaim2 | undefined;
  handleClick?: (() => void) | undefined;
  key: string;
  markdownDefinition: Definition;
};

type Props = Readonly<{
  activity: WebChatActivity;
  markdown: string;
}>;

const MarkdownTextContent = memo(({ activity, markdown }: Props) => {
  const [
    {
      citationModalDialog: citationModalDialogStyleSet,
      renderMarkdown: renderMarkdownStyleSet,
      textContent: textContentStyleSet
    }
  ] = useStyleSet();
  const localize = useLocalizer();
  const messageThing = useMemo(() => getOrgSchemaMessage(activity), [activity]);
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
        markdownDefinitions.map<Entry>(markdownDefinition => {
          const claim = messageThing?.citation?.map(parseClaim).find(({ '@id': id }) => id === markdownDefinition.url);

          return {
            claim,
            key: markdownDefinition.url,
            markdownDefinition,
            handleClick:
              claim?.appearance && !claim.appearance.url
                ? () => showClaimModal(markdownDefinition.title, claim.appearance.text, claim.alternateName)
                : undefined
          };
        })
      ),
    [markdownDefinitions, messageThing, showClaimModal]
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
        text: usageInfo.name,
        tooltip: usageInfo.description
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
              badgeText={entry.claim?.appearance?.usageInfo?.name}
              badgeTooltip={[entry.claim?.appearance?.usageInfo?.name, entry.claim?.appearance?.usageInfo?.description]
                .filter(Boolean)
                .join('\n\n')}
              identifier={entry.markdownDefinition.identifier}
              key={entry.key}
              onClick={entry.handleClick}
              text={entry.markdownDefinition.title}
              url={entry.claim?.appearance ? entry.claim.appearance.url : entry.markdownDefinition.url}
            />
          ))}
        </LinkDefinitions>
      )}
    </div>
  );
});

MarkdownTextContent.displayName = 'MarkdownTextContent';

export default MarkdownTextContent;
