/* eslint no-magic-numbers: ["error", { "ignore": [0, 2] }] */

import PropTypes from 'prop-types';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { Components, getTabIndex, hooks } from 'botframework-webchat-component';

import useAdaptiveCardsHostConfig from '../hooks/useAdaptiveCardsHostConfig';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';

const { ErrorBox } = Components;
const { useDisabled, useLocalize, usePerformCardAction, useRenderMarkdownAsHTML, useStyleSet } = hooks;

function isPlainObject(obj) {
  return Object.getPrototypeOf(obj) === Object.prototype;
}

function disableInputElements(element) {
  const hyperlinks = element.querySelectorAll('a');
  const inputs = element.querySelectorAll('button, input, select, textarea');

  const disabledHandler = event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  };

  [].forEach.call(inputs, input => {
    input.disabled = true;
  });

  [].forEach.call(hyperlinks, hyperlink => {
    hyperlink.addEventListener('click', disabledHandler);
  });
}

function restoreInputValues(element, inputValues) {
  const inputs = element.querySelectorAll('input, select, textarea');

  [].forEach.call(inputs, (input, index) => {
    const value = inputValues[index];

    if (typeof value !== 'undefined') {
      const { tagName, type } = input;

      if (tagName === 'INPUT' && (type === 'checkbox' || type === 'radio')) {
        input.checked = value;
      } else {
        input.value = value;
      }
    }
  });
}

function saveInputValues(element) {
  const inputs = element.querySelectorAll('input, select, textarea');

  return [].map.call(inputs, ({ checked, tagName, type, value }) => {
    if (tagName === 'INPUT' && (type === 'checkbox' || type === 'radio')) {
      return checked;
    }

    return value;
  });
}

const AdaptiveCardRenderer = ({ adaptiveCard, tapAction }) => {
  const [{ adaptiveCardRenderer: adaptiveCardRendererStyleSet }] = useStyleSet();
  const [{ HostConfig }] = useAdaptiveCardsPackage();
  const [adaptiveCardsHostConfig] = useAdaptiveCardsHostConfig();
  const [disabled] = useDisabled();
  const errorMessage = useLocalize('Adaptive Card render error');
  const performCardAction = usePerformCardAction();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();

  const [error, setError] = useState();
  const contentRef = useRef();
  const inputValuesRef = useRef([]);

  const handleClick = useCallback(
    ({ target }) => {
      // Some items, e.g. tappable text, cannot be disabled thru DOM attributes
      if (!disabled) {
        const tabIndex = getTabIndex(target);

        // If the user is clicking on something that is already clickable, do not allow them to click the card.
        // E.g. a hero card can be tappable, and image and buttons inside the hero card can also be tappable.
        if (typeof tabIndex !== 'number' || tabIndex < 0) {
          tapAction && performCardAction(tapAction);
        }
      }
    },
    [disabled, performCardAction, tapAction]
  );

  const handleExecuteAction = useCallback(
    action => {
      // Some items, e.g. tappable image, cannot be disabled thru DOM attributes
      if (disabled) {
        return;
      }

      const actionTypeName = action.getJsonTypeName();

      if (actionTypeName === 'Action.OpenUrl') {
        performCardAction({
          type: 'openUrl',
          value: action.url
        });
      } else if (actionTypeName === 'Action.Submit') {
        if (typeof action.data !== 'undefined') {
          const { data: actionData } = action;

          if (actionData && actionData.__isBotFrameworkCardAction) {
            const { cardAction } = actionData;
            const { displayText, type, value } = cardAction;

            performCardAction({ displayText, type, value });
          } else {
            performCardAction({
              type: typeof action.data === 'string' ? 'imBack' : 'postBack',
              value: action.data
            });
          }
        }
      } else {
        console.error(`Web Chat: received unknown action from Adaptive Cards`);
        console.error(action);
      }
    },
    [disabled, performCardAction]
  );

  useLayoutEffect(() => {
    const { current } = contentRef;

    if (current && adaptiveCard) {
      // Currently, the only way to set the Markdown engine is to set it thru static member of AdaptiveCard class

      // TODO: [P3] Checks if we could make the "renderMarkdownAsHTML" per card
      //       This could be limitations from Adaptive Cards package
      //       Because there could be timing difference between .parse and .render, we could be using wrong Markdown engine

      adaptiveCard.constructor.onProcessMarkdown = (text, result) => {
        if (renderMarkdownAsHTML) {
          result.outputHtml = renderMarkdownAsHTML(text);
          result.didProcess = true;
        }
      };

      adaptiveCard.onExecuteAction = handleExecuteAction;

      if (adaptiveCardsHostConfig) {
        adaptiveCard.hostConfig = isPlainObject(adaptiveCardsHostConfig)
          ? new HostConfig(adaptiveCardsHostConfig)
          : adaptiveCardsHostConfig;
      }

      const { failures } = adaptiveCard.validateProperties();

      if (failures.length) {
        // TODO: [P3] Since this can be called from `componentDidUpdate` and potentially error, we should fix a better way to propagate the error.
        const errors = failures.reduce((items, { errors }) => [...items, ...errors], []);

        return setError(errors);
      }

      let element;

      try {
        element = adaptiveCard.render();
      } catch (error) {
        return setError(error);
      }

      if (!element) {
        return setError('Adaptive Card rendered as empty element');
      }

      error && setError(null);

      disabled && disableInputElements(element);
      restoreInputValues(element, inputValuesRef.current);

      const [firstChild] = current.children;

      if (firstChild) {
        current.replaceChild(element, firstChild);
      } else {
        current.appendChild(element);
      }

      return () => {
        inputValuesRef.current = saveInputValues(element);
      };
    }
  }, [
    adaptiveCard,
    adaptiveCardsHostConfig,
    contentRef,
    disabled,
    error,
    handleExecuteAction,
    HostConfig,
    renderMarkdownAsHTML
  ]);

  return error ? (
    <ErrorBox message={errorMessage}>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </ErrorBox>
  ) : (
    <div className={adaptiveCardRendererStyleSet} onClick={handleClick} ref={contentRef} />
  );
};

AdaptiveCardRenderer.propTypes = {
  adaptiveCard: PropTypes.any.isRequired,
  tapAction: PropTypes.shape({
    type: PropTypes.string.isRequired,
    value: PropTypes.string
  })
};

AdaptiveCardRenderer.defaultProps = {
  tapAction: undefined
};

export default AdaptiveCardRenderer;
