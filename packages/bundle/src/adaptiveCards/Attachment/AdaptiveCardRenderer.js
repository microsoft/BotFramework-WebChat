/* eslint no-magic-numbers: ["error", { "ignore": [0, 2] }] */

import { HostConfig } from 'adaptivecards';
import PropTypes from 'prop-types';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { Components, getTabIndex, useLocalize, useStyleSet, useWebChat } from 'botframework-webchat-component';

const { ErrorBox } = Components;

function isPlainObject(obj) {
  return Object.getPrototypeOf(obj) === Object.prototype;
}

const AdaptiveCardRenderer = ({ adaptiveCard, adaptiveCardHostConfig }) => {
  const { disabled, language, onCardAction, renderMarkdown, tapAction } = useWebChat();
  const styleSet = useStyleSet();
  const contentRef = useRef();
  const handleClick = useCallback(
    ({ target }) => {
      // Some items, e.g. tappable text, cannot be disabled thru DOM attributes
      if (!disabled) {
        const tabIndex = getTabIndex(target);

        // If the user is clicking on something that is already clickable, do not allow them to click the card.
        // E.g. a hero card can be tappable, and image and buttons inside the hero card can also be tappable.
        if (typeof tabIndex !== 'number' || tabIndex < 0) {
          tapAction && onCardAction(tapAction);
        }
      }
    },
    [disabled, onCardAction, tapAction]
  );

  const handleExecuteAction = useCallback(
    action => {
      // Some items, e.g. tappable image, cannot be disabled thru DOM attributes
      if (disabled) {
        return;
      }

      const actionTypeName = action.getJsonTypeName();

      if (actionTypeName === 'Action.OpenUrl') {
        onCardAction({
          type: 'openUrl',
          value: action.url
        });
      } else if (actionTypeName === 'Action.Submit') {
        if (typeof action.data !== 'undefined') {
          const { data: actionData } = action;

          if (actionData && actionData.__isBotFrameworkCardAction) {
            const { cardAction } = actionData;
            const { displayText, type, value } = cardAction;

            onCardAction({ displayText, type, value });
          } else {
            onCardAction({
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
    [disabled, onCardAction]
  );

  const renderCard = useCallback(() => {
    const { current } = contentRef;

    if (current && adaptiveCard) {
      // Currently, the only way to set the Markdown engine is to set it thru static member of AdaptiveCard class

      // TODO: [P3] Checks if we could make the "renderMarkdown" per card
      //       This could be limitations from Adaptive Cards package
      //       Because there could be timing difference between .parse and .render, we could be using wrong Markdown engine

      adaptiveCard.constructor.onProcessMarkdown = (text, result) => {
        if (renderMarkdown) {
          result.outputHtml = renderMarkdown(text);
          result.didProcess = true;
        }
      };

      adaptiveCard.onExecuteAction = handleExecuteAction;

      if (adaptiveCardHostConfig) {
        adaptiveCard.hostConfig = isPlainObject(adaptiveCardHostConfig)
          ? new HostConfig(adaptiveCardHostConfig)
          : adaptiveCardHostConfig;
      }

      const { failures } = adaptiveCard.validateProperties();

      if (failures.length) {
        // TODO: [P3] Since this can be called from `componentDidUpdate` and potentially error, we should fix a better way to propagate the error.
        const errors = failures.reduce((items, { errors }) => [...items, ...errors], []);
        return this.setState(() => ({ error: errors }));
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

      if (disabled) {
        const hyperlinks = element.querySelectorAll('a');
        const inputs = element.querySelectorAll('button, input, select, textarea');

        [].forEach.call(inputs, input => {
          input.disabled = true;
        });

        [].forEach.call(hyperlinks, hyperlink => {
          hyperlink.addEventListener('click', event => {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
          });
        });
      }

      const [firstChild] = current.children;

      if (firstChild) {
        current.replaceChild(element, firstChild);
      } else {
        current.appendChild(element);
      }
    }
  }, [adaptiveCard, adaptiveCardHostConfig, contentRef.current, disabled, error, handleExecuteAction, renderMarkdown]);

  const [error, setError] = useState();

  useLayoutEffect(() => {
    renderCard();
  }, [adaptiveCard]);

  const errorMessage = useLocalize('Adaptive Card render error');

  return error ? (
    <ErrorBox message={errorMessage}>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </ErrorBox>
  ) : (
    <div className={styleSet.adaptiveCardRenderer} onClick={handleClick} ref={contentRef} />
  );
};

AdaptiveCardRenderer.propTypes = {
  adaptiveCard: PropTypes.any.isRequired,
  adaptiveCardHostConfig: PropTypes.any.isRequired
};

export default AdaptiveCardRenderer;
