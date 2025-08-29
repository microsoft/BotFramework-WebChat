import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
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
import { fromMarkdown } from 'mdast-util-from-markdown';
import React, { memo, useCallback, useMemo, useRef, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { custom, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import ActivityFeedback from '../../../ActivityFeedback/ActivityFeedback';
import { LinkDefinitionItem, LinkDefinitions } from '../../../LinkDefinition/index';
import dereferenceBlankNodes from '../../../Utils/JSONLinkedData/dereferenceBlankNodes';
import useSanitizeHrefCallback from '../../../hooks/internal/useSanitizeHrefCallback';
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
  /** Do not use the key as URL, it is not sanitized. */
  key: string;
  markdownDefinition: Definition;
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
  appearance: {
    url?: undefined;
  };
} {
  return !!claim.appearance && !claim.appearance.url;
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

  const sanitizeHref = useSanitizeHrefCallback();

  const entries = useMemo<readonly Entry[]>(
    () =>
      Object.freeze(
        markdownDefinitions
          .map<Entry | undefined>(markdownDefinition => {
            let messageCitation: OrgSchemaClaim | undefined = messageThing?.citation
              ?.map(parseClaim)
              .find(({ position }) => '' + position === markdownDefinition.identifier);

            if (!messageCitation) {
              const rootLevelClaim = graph
                .filter(({ type }) => type === 'https://schema.org/Claim')
                .map(parseClaim)
                .find(({ '@id': id }) => id === markdownDefinition.url);

              if (rootLevelClaim) {
                console.warn(
                  'botframework-webchat: Root-level `Claim` thing is deprecated, please use `Message[@id=""].citation[@type="Claim"]` instead. It will be removed on or after 2027-08-29.'
                );

                messageCitation = {
                  '@context': 'https://schema.org',
                  '@id': markdownDefinition.url,
                  '@type': 'Claim',
                  alternateName: rootLevelClaim.alternateName,
                  appearance: isCitationURL(rootLevelClaim['@id'])
                    ? {
                        '@type': 'DigitalDocument',
                        name: rootLevelClaim.name,
                        text: rootLevelClaim.text
                      }
                    : {
                        '@type': 'DigitalDocument',
                        url: markdownDefinition.url
                      }
                };
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
                      appearance.name ?? markdownDefinition.title,
                      appearance.text,
                      messageCitation.alternateName
                    ),
                  markdownDefinition
                };
              }

              // Not inline citation, we care about the URL.
              // Warn if it break single source of truth principle, we still use the URL from Markdown.
              if (messageCitation.appearance?.url && messageCitation.appearance.url !== url) {
                console.warn(
                  'botframework-webchat: When "Message.citation[].url" is set in entities, it must match its corresponding URL in Markdown link reference definition',
                  {
                    citation: messageCitation,
                    markdownDefinition,
                    url: {
                      citation: messageCitation.appearance.url,
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
    entry.claim?.name ?? entry.claim?.appearance?.name ?? (entry.markdownDefinition.title || undefined);

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
              sanitizedHref={entry.sanitizedHref}
              text={getEntryMainText(entry)}
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
