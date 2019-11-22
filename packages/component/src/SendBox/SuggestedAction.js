import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import connectToWebChat from '../connectToWebChat';
import useDisabled from '../hooks/useDisabled';
import useFocusSendBox from '../hooks/useFocusSendBox';
import usePerformCardAction from '../hooks/usePerformCardAction';
import useStyleSet from '../hooks/useStyleSet';
import useSuggestedActions from '../hooks/useSuggestedActions';

const SUGGESTED_ACTION_CSS = css({
  display: 'flex',
  flexDirection: 'column',
  whiteSpace: 'initial',

  '& > button': {
    display: 'flex',
    overflow: 'hidden'
  }
});

const connectSuggestedAction = (...selectors) =>
  connectToWebChat(
    ({ clearSuggestedActions, disabled, language, onCardAction }, { displayText, text, type, value }) => ({
      click: () => {
        onCardAction({ displayText, text, type, value });
        type === 'openUrl' && clearSuggestedActions();
      },
      disabled,
      language
    }),
    ...selectors
  );

const SuggestedAction = ({ 'aria-hidden': ariaHidden, buttonText, displayText, image, text, type, value }) => {
  const [_, setSuggestedActions] = useSuggestedActions();
  const [{ suggestedAction: suggestedActionStyleSet }] = useStyleSet();
  const [disabled] = useDisabled();
  const focusSendBox = useFocusSendBox();
  const performCardAction = usePerformCardAction();

  const handleClick = useCallback(() => {
    performCardAction({ displayText, text, type, value });
    type === 'openUrl' && setSuggestedActions([]);
    focusSendBox();
  }, [displayText, focusSendBox, performCardAction, setSuggestedActions, text, type, value]);

  return (
    <div aria-hidden={ariaHidden} className={classNames(suggestedActionStyleSet + '', SUGGESTED_ACTION_CSS + '')}>
      <button disabled={disabled} onClick={handleClick} type="button">
        {image && <img src={image} />}
        <nobr>{buttonText}</nobr>
      </button>
    </div>
  );
};

SuggestedAction.defaultProps = {
  'aria-hidden': false,
  displayText: '',
  image: '',
  text: '',
  type: '',
  value: undefined
};

SuggestedAction.propTypes = {
  'aria-hidden': PropTypes.bool,
  buttonText: PropTypes.string.isRequired,
  displayText: PropTypes.string,
  image: PropTypes.string,
  text: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.any
};

export default SuggestedAction;

export { connectSuggestedAction };
