import { hooks } from 'botframework-webchat-api';
import type { DirectLineCardAction } from 'botframework-webchat-core';
import { useStyles } from '../../styles';
import React, { type ReactNode } from 'react';
import cx from 'classnames';
import useStyleSet from 'botframework-webchat-component/lib/hooks/useStyleSet';
import computeSuggestedActionText from 'botframework-webchat-component/lib//Utils/computeSuggestedActionText';
import SuggestedAction from 'botframework-webchat-component/lib/SendBox/SuggestedAction';

const { useLocalizer, useSuggestedActions } = hooks;

const styles = {
  'webchat-fluent__sendbox__suggested-actions': {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingBlockEnd: '8px',
    paddingInlineStart: '4px'
  },

  'webchat-fluent__sendbox__action': {
    background: 'transparent',
    border: '1px solid var(--colorBrandStroke2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    lineHeight: '12px',
    padding: '6px 8px 4px',
    textAlign: 'start'
  }
};

function SuggestedActionStackedContainer(
  props: Readonly<{
    label?: string | undefined;
    children?: ReactNode | undefined;
    className?: string | undefined;
  }>
) {
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const classNames = useStyles(styles);

  return (
    <div
      aria-label={props.label}
      aria-live="polite"
      aria-orientation="vertical"
      className={cx(
        classNames['webchat-fluent__sendbox__suggested-actions'],
        suggestedActionsStyleSet + '',
        props.className
      )}
      role="toolbar"
    >
      {!!props.children && !!React.Children.count(props.children) && props.children}
      <div className="webchat__suggested-actions__focus-indicator" />
    </div>
  );
}

export function SuggestedActions() {
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  // TODO: fix either how we use the suggestedActions or the type of useSuggestedActions
  const [suggestedActions]: [DirectLineCardAction[]] = useSuggestedActions() as any;

  const children = suggestedActions.map((cardAction, index) => {
    const { displayText, image, imageAltText, text, type, value } = cardAction as {
      displayText?: string;
      image?: string;
      imageAltText?: string;
      text?: string;
      type:
        | 'call'
        | 'downloadFile'
        | 'imBack'
        | 'messageBack'
        | 'openUrl'
        | 'playAudio'
        | 'playVideo'
        | 'postBack'
        | 'showImage'
        | 'signin';
      value?: { [key: string]: any } | string;
    };

    return (
      // eslint-disable-next-line react/no-array-index-key
      <div className="webchat__suggested-actions__item-box" key={index}>
        <SuggestedAction
          buttonText={computeSuggestedActionText(cardAction)}
          className={classNames['webchat-fluent__sendbox__action']}
          displayText={displayText}
          image={image}
          // Image alt text should use `imageAltText` field and fallback to `text` field.
          // https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#image-alt-text
          imageAlt={image && (imageAltText || text)}
          itemIndex={index}
          text={text}
          type={type}
          value={value}
        />
      </div>
    );
  });
  return (
    <SuggestedActionStackedContainer label={localize('SUGGESTED_ACTIONS_LABEL_ALT')}>
      {children}
    </SuggestedActionStackedContainer>
  );
}
