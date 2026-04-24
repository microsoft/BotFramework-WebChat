import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import {
  getOrgSchemaMessage,
  onErrorResumeNext,
  orgSchemaClaimSchema,
  type OrgSchemaClaim,
  type OrgSchemaCreativeWork,
  type WebChatActivity
} from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo, useCallback, useMemo, useRef, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { custom, object, optional, parse, pipe, readonly, string, type InferInput } from 'valibot';

import ActivityFeedback from '../../../ActivityFeedback/ActivityFeedback';
import { LinkDefinitionItem, LinkDefinitions } from '../../../LinkDefinition/index';
import dereferenceBlankNodes from '../../../Utils/JSONLinkedData/dereferenceBlankNodes';
import getFirstBaseOfSoftwareSourceCode from '../../../Utils/orgSchema/getFirstBaseOfSoftwareSourceCode';
import useSanitizeHrefCallback from '../../../hooks/internal/useSanitizeHrefCallback';
import useStreamingMarkdownWithDefinitions, {
  type MarkdownLinkDefinition
} from '../../../hooks/useStreamingMarkdownWithDefinitions';
import useShowModal from '../../../providers/ModalDialog/useShowModal';
import ActivityCopyButton from './ActivityCopyButton';
import ActivityViewCodeButton from './ActivityViewCodeButton';
import CitationModalContext from './CitationModalContent';
import MessageSensitivityLabel, { type MessageSensitivityLabelProps } from './MessageSensitivityLabel';
import isAIGeneratedActivity from './isAIGeneratedActivity';
import isHTMLButtonElement from './isHTMLButtonElement';

import textContentStyles from '../TextContent.module.css';
import citationModalStyles from './CitationModal.module.css';

const { useLocalizer, useStyleOptions } = hooks;

type Entry = {
  claim?: OrgSchemaClaim | undefined;
  /** Do not use the key as URL, it is not sanitized. */
  key: string;
  markdownDefinition: MarkdownLinkDefinition;
} & (
  | {
      // Inline citation.
      handleClick: () => void;
      sanitizedHref?: undefined;
    }
  | {
      // Citation link.
      handleClick?: undefined;
      sanitizedHref: string;
    }
);

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

function isCitingInline(claim: OrgSchemaClaim): claim is OrgSchemaClaim & {
  appearance: [OrgSchemaCreativeWork & { readonly url: never[] }];
} {
  return !!claim.appearance.length && !claim.appearance[0].url.length;
}

function MarkdownTextContent(props: MarkdownTextContentProps) {
  const { activity, children, markdown } = validateProps(markdownTextContentPropsSchema, props);

  const citationModalClassNames = useStyles(citationModalStyles);
  const textContentClassNames = useStyles(textContentStyles);

  const [{ feedbackActionsPlacement }] = useStyleOptions();
  const contentRef = useRef<HTMLDivElement>(null);
  const localize = useLocalizer();
  const graph = useMemo(() => dereferenceBlankNodes(activity.entities || []), [activity.entities]);
  const showModal = useShowModal();

  const { definitions: markdownDefinitions } = useStreamingMarkdownWithDefinitions(
    contentRef,
    markdown,
    activity.type === 'message'
  );

  const messageThing = useMemo(() => getOrgSchemaMessage(graph), [graph]);

  const citationModalDialogLabel = localize('CITATION_MODEL_DIALOG_ALT');

  const showClaimModal = useCallback(
    (title: string | undefined, text: string, altText: string | undefined) => {
      showModal(() => <CitationModalContext headerText={title} markdown={text} />, {
        'aria-label': altText || title || citationModalDialogLabel,
        className: citationModalClassNames['citation-modal-dialog']
      });
    },
    [citationModalClassNames, citationModalDialogLabel, showModal]
  );

  const sanitizeHref = useSanitizeHrefCallback();

  const entries = useMemo<readonly Entry[]>(
    () =>
      Object.freeze(
        markdownDefinitions
          .map<Entry | undefined>(markdownDefinition => {
            let messageCitation: OrgSchemaClaim | undefined = messageThing?.citation
              .map(claim => parse(orgSchemaClaimSchema, claim))
              .find(({ position }) => '' + position[0] === markdownDefinition.identifier);

            if (!messageCitation) {
              const rootLevelClaim = graph
                .filter(({ type }) => type === 'https://schema.org/Claim')
                .map(claim => parse(orgSchemaClaimSchema, claim))
                .find(({ '@id': id }) => id === markdownDefinition.url);

              if (rootLevelClaim) {
                console.warn(
                  'botframework-webchat: Root-level `Claim` thing is deprecated, please use `Message[@id=""].citation[@type="Claim"]` instead. It will be removed on or after 2027-08-29.'
                );

                messageCitation = parse(orgSchemaClaimSchema, {
                  '@context': 'https://schema.org',
                  '@id': markdownDefinition.url,
                  '@type': 'Claim',
                  alternateName: rootLevelClaim.alternateName,
                  appearance: [
                    isCitationURL(rootLevelClaim['@id'])
                      ? {
                          '@type': 'DigitalDocument',
                          name: rootLevelClaim.name,
                          text: rootLevelClaim.text
                        }
                      : {
                          '@type': 'DigitalDocument',
                          url: markdownDefinition.url
                        }
                  ]
                } satisfies InferInput<typeof orgSchemaClaimSchema>);
              }
            }

            const { url } = markdownDefinition;
            const { sanitizedHref } = sanitizeHref(markdownDefinition.url);

            // After HTML content transform (or sanitization), the link could be gone.
            // In that case, Markdown will not render the link. We also need to remove it from citation.
            if (messageCitation) {
              // For inline citation, the URL is an opaque string to us.
              // We don't care if it's sanitized or not.
              if (isCitingInline(messageCitation)) {
                const { appearance } = messageCitation;

                return {
                  claim: messageCitation,
                  key: url,
                  handleClick: () =>
                    showClaimModal(
                      appearance[0]?.name[0] ?? markdownDefinition.title,
                      appearance[0]?.text[0],
                      messageCitation.alternateName[0]
                    ),
                  markdownDefinition
                };
              }

              // Not inline citation, we care about the URL.
              // Warn if it break single source of truth principle, we still use the URL from Markdown.
              if (messageCitation.appearance[0]?.url[0] && messageCitation.appearance[0]?.url[0] !== url) {
                console.warn(
                  'botframework-webchat: When "Message.citation[].url" is set in entities, it must match its corresponding URL in Markdown link reference definition',
                  {
                    citation: messageCitation,
                    markdownDefinition,
                    url: {
                      citation: messageCitation.appearance[0]?.url[0],
                      markdown: url
                    }
                  }
                );
              }

              if (sanitizedHref) {
                // URL is sanitized and is not inline citation.
                return {
                  claim: messageCitation,
                  key: markdownDefinition.url,
                  markdownDefinition,
                  sanitizedHref: markdownDefinition.url // Single source of truth.
                };
              }

              // Not sanitized and not inline, remove it from citation.
              return;
            }

            return (
              sanitizedHref && {
                key: markdownDefinition.url,
                markdownDefinition,
                sanitizedHref
              }
            );
          })
          .filter(Boolean)
      ),
    [graph, markdownDefinitions, messageThing, sanitizeHref, showClaimModal]
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

  const messageSensitivityLabelProps = useMemo<MessageSensitivityLabelProps | undefined>(() => {
    const usageInfo = messageThing?.usageInfo[0];

    if (usageInfo) {
      const [pattern] = usageInfo.pattern;
      const encryptionStatus = !!usageInfo.keywords?.find(keyword => keyword === 'encrypted-content');

      return {
        color:
          pattern &&
          pattern.inDefinedTermSet[0] === 'https://www.w3.org/TR/css-color-4/' &&
          pattern.name[0] === 'color' &&
          pattern.termCode[0],
        isEncrypted: encryptionStatus,
        name: usageInfo.name[0],
        title: usageInfo.description[0]
      } satisfies MessageSensitivityLabelProps;
    }
  }, [messageThing]);

  // The main text of the citation entry (e.g. the title of the document). Used as the content of the main link and, if it exists, the header of the popup window.
  const getEntryMainText = (entry: Entry): string | undefined =>
    entry.claim?.name[0] ?? entry.claim?.appearance[0]?.name[0] ?? (entry.markdownDefinition.title || undefined);

  // Optional alternate name for the entry, used as a subtitle beneath the link
  const getEntryBadgeName = (entry: Entry): string | undefined => entry.claim?.appearance[0]?.usageInfo[0]?.name[0];

  // Secondary text describing the citation, used in the a11y description (i.e. the div's title attribute)
  const getEntryDescription = (entry: Entry): string | undefined =>
    entry.claim?.appearance[0]?.usageInfo[0]?.description[0];

  const firstSoftwareSourceCodeBase = useMemo(() => getFirstBaseOfSoftwareSourceCode(messageThing), [messageThing]);

  return (
    <div className={cx(textContentClassNames['text-content'], textContentClassNames['text-content--is-markdown'])}>
      <div className={cx(textContentClassNames['text-content__markdown'])} onClick={handleClick} ref={contentRef} />
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
              sanitizedHref={entry.sanitizedHref}
              text={getEntryMainText(entry)}
            />
          ))}
        </LinkDefinitions>
      )}
      <div className={textContentClassNames['text-content__activity-actions']}>
        {activity.type === 'message' &&
        firstSoftwareSourceCodeBase?.text &&
        !messageThing?.keywords.includes('Collapsible') ? (
          <ActivityViewCodeButton
            className="text-content__activity-view-code-button"
            code={firstSoftwareSourceCodeBase.text[0]}
            isAIGenerated={isAIGeneratedActivity(activity)}
            language={firstSoftwareSourceCodeBase.programmingLanguage[0]}
            title={firstSoftwareSourceCodeBase.programmingLanguage[0]}
          />
        ) : null}
        {activity.type === 'message' && activity.text && messageThing?.keywords.includes('AllowCopy') ? (
          <ActivityCopyButton className="text-content__activity-copy-button" targetRef={contentRef} />
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
