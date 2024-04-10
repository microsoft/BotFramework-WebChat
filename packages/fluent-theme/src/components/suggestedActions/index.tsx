import { hooks } from 'botframework-webchat-component';
import cx from 'classnames';
import React, { memo, type ReactNode } from 'react';
import { useStyles } from '../../styles';
import computeSuggestedActionText from './private/computeSuggestedActionText';
import SuggestedAction from './SuggestedAction';

const { useLocalizer, useStyleSet, useSuggestedActions } = hooks;

const styles = {
  'webchat-fluent__suggested-actions': {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',

    '&:not(:empty)': {
      paddingBlockEnd: '8px',
      paddingInlineStart: '4px'
    }
  }
};

function SuggestedActionStackedContainer(
  props: Readonly<{
    'aria-label'?: string | undefined;
    children?: ReactNode | undefined;
    className?: string | undefined;
  }>
) {
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const classNames = useStyles(styles);

  return (
    <div
      aria-label={props['aria-label']}
      aria-live="polite"
      aria-orientation="vertical"
      className={cx(classNames['webchat-fluent__suggested-actions'], suggestedActionsStyleSet + '', props.className)}
      role="toolbar"
    >
      {!!props.children && !!React.Children.count(props.children) && props.children}
    </div>
  );
}

function SuggestedActions() {
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const [suggestedActions] = useSuggestedActions();
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

    if (!suggestedActions?.length) {
      return null;
    }

    return (
      <SuggestedAction
        buttonText={computeSuggestedActionText(cardAction)}
        displayText={displayText}
        image={image}
        // Image alt text should use `imageAltText` field and fallback to `text` field.
        // https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#image-alt-text
        imageAlt={image && (imageAltText || text)}
        itemIndex={index}
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        text={text}
        type={type}
        value={value}
      />
    );
  });
  return (
    <SuggestedActionStackedContainer
      aria-label={localize('SUGGESTED_ACTIONS_LABEL_ALT')}
      className={classNames['webchat-fluent__suggested-actions']}
    >
      {children}
    </SuggestedActionStackedContainer>
  );
}

export default memo(SuggestedActions);
