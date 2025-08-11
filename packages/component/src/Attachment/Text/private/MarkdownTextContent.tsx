import { hooks } from 'botframework-webchat-api';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import {
  getOrgSchemaMessage,
  onErrorResumeNext,
  parseClaim,
  type OrgSchemaClaim,
  type WebChatActivity
} from 'botframework-webchat-core';
import classNames from 'classnames';
import type { Definition } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import React, { memo, useCallback, useMemo, useRef, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { custom, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import ActivityFeedback from '../../../ActivityFeedback/ActivityFeedback';
import { LinkDefinitionItem, LinkDefinitions } from '../../../LinkDefinition/index';
import dereferenceBlankNodes from '../../../Utils/JSONLinkedData/dereferenceBlankNodes';
import useRenderMarkdownAsHTML from '../../../hooks/useRenderMarkdownAsHTML';
import useStyleSet from '../../../hooks/useStyleSet';
import useShowModal from '../../../providers/ModalDialog/useShowModal';
import { type PropsOf } from '../../../types/PropsOf';
import ActivityCopyButton from './ActivityCopyButton';
import ActivityViewCodeButton from './ActivityViewCodeButton';
import CitationModalContext from './CitationModalContent';
import MessageSensitivityLabel, { type MessageSensitivityLabelProps } from './MessageSensitivityLabel';
import isAIGeneratedActivity from './isAIGeneratedActivity';
import isBasedOnSoftwareSourceCode from './isBasedOnSoftwareSourceCode';
import isHTMLButtonElement from './isHTMLButtonElement';

const { useLocalizer, useStyleOptions } = hooks;

type Entry = {
  claim?: OrgSchemaClaim | undefined;
  handleClick?: (() => void) | undefined;
  key: string;
  markdownDefinition: Definition;
  url?: string | undefined;
};

const markdownTextContentPropsSchema = pipe(
  object({
    activity: custom<WebChatActivity>(() => true),
    children: optional(reactNode()),
    markdown: string()
  }),
  readonly()
);

type MarkdownTextContentProps = InferInput<typeof markdownTextContentPropsSchema>;

function isCitationURL(url: string): boolean {
  return onErrorResumeNext(() => new URL(url))?.protocol === 'cite:';
}

function MarkdownTextContent(props: MarkdownTextContentProps) {
  const { activity, children, markdown } = validateProps(markdownTextContentPropsSchema, props);

  const [{ feedbackActionsPlacement }] = useStyleOptions();
  const [
    {
      citationModalDialog: citationModalDialogStyleSet,
      renderMarkdown: renderMarkdownStyleSet,
      textContent: textContentStyleSet
    }
  ] = useStyleSet();
  const contentRef = useRef<HTMLDivElement>(null);
  const localize = useLocalizer();
  const graph = useMemo(() => dereferenceBlankNodes(activity.entities || []), [activity.entities]);
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('message activity');
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
            .find(({ position }) => '' + position === markdownDefinition.identifier);

          if (messageCitation) {
            return {
              claim: messageCitation,
              key: markdownDefinition.url,
              handleClick:
                messageCitation?.appearance && !messageCitation.appearance.url
                  ? () =>
                      showClaimModal(
                        messageCitation.appearance.name ?? markdownDefinition.title,
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
                ? () =>
                    showClaimModal(
                      rootLevelClaim.name ?? markdownDefinition.title,
                      rootLevelClaim.text,
                      rootLevelClaim.alternateName
                    )
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
      const encryptionStatus = !!usageInfo.keywords?.find(keyword => keyword === 'encrypted-content');

      return {
        color:
          pattern &&
          pattern.inDefinedTermSet === 'https://www.w3.org/TR/css-color-4/' &&
          pattern.name === 'color' &&
          pattern.termCode,
        isEncrypted: encryptionStatus,
        name: usageInfo.name,
        title: usageInfo.description
      };
    }
  }, [messageThing]);

  // The main text of the citation entry (e.g. the title of the document). Used as the content of the main link and, if it exists, the header of the popup window.
  const getEntryMainText = (entry: Entry) =>
    entry.claim?.name ?? entry.claim?.appearance?.name ?? entry.markdownDefinition.title;

  // Optional alternate name for the entry, used as a subtitle beneath the link
  const getEntryBadgeName = (entry: Entry) => entry.claim?.appearance?.usageInfo?.name;

  // Secondary text describing the citation, used in the a11y description (i.e. the div's title attribute)
  const getEntryDescription = (entry: Entry) => entry.claim?.appearance?.usageInfo?.description;

  return (
    <div
      className={classNames('webchat__text-content', 'webchat__text-content--is-markdown', textContentStyleSet + '')}
    >
      <div
        className={classNames('webchat__text-content__markdown', renderMarkdownStyleSet + '')}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        onClick={handleClick}
        ref={contentRef}
      />
      {children}
      {!!entries.length && (
        <LinkDefinitions<MessageSensitivityLabelProps>
          accessoryComponentType={messageSensitivityLabelProps && MessageSensitivityLabel}
          accessoryProps={messageSensitivityLabelProps}
        >
          {entries.map(entry => (
            <LinkDefinitionItem
              badgeName={getEntryBadgeName(entry)}
              badgeTitle={`${getEntryBadgeName(entry) ?? ''}\n\n${getEntryDescription(entry) ?? ''}`.trim()}
              identifier={entry.markdownDefinition.label}
              key={entry.key}
              onClick={entry.handleClick}
              text={getEntryMainText(entry)}
              url={entry.url}
            />
          ))}
        </LinkDefinitions>
      )}
      <div className="webchat__text-content__activity-actions">
        {activity.type === 'message' &&
        isBasedOnSoftwareSourceCode(messageThing) &&
        messageThing.isBasedOn.text &&
        !messageThing.keywords?.includes?.('Collapsible') ? (
          <ActivityViewCodeButton
            className="webchat__text-content__activity-view-code-button"
            code={messageThing.isBasedOn.text}
            isAIGenerated={isAIGeneratedActivity(activity)}
            language={messageThing.isBasedOn.programmingLanguage}
            title={messageThing.isBasedOn.programmingLanguage}
          />
        ) : null}
        {activity.type === 'message' && activity.text && messageThing?.keywords?.includes('AllowCopy') ? (
          <ActivityCopyButton className="webchat__text-content__activity-copy-button" targetRef={contentRef} />
        ) : null}
        {activity.type === 'message' && feedbackActionsPlacement === 'activity-actions' && (
          <ActivityFeedback activity={activity} />
        )}
      </div>
    </div>
  );
}

export default memo(MarkdownTextContent);
export { markdownTextContentPropsSchema, type MarkdownTextContentProps };
