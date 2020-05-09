/* eslint no-magic-numbers: ["error", { "ignore": [0, 2] }] */

import { Components, getTabIndex, hooks } from 'botframework-webchat-component';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

import useAdaptiveCardsHostConfig from '../hooks/useAdaptiveCardsHostConfig';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';

const { ErrorBox } = Components;
const { useDisabled, useLocalizer, usePerformCardAction, useRenderMarkdownAsHTML, useScrollToEnd, useStyleSet } = hooks;

function isPlainObject(obj) {
  return Object.getPrototypeOf(obj) === Object.prototype;
}

const disabledHandler = event => {
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();
};

function disableInputElements(element, observeSubtree) {
  [].forEach.call(element.querySelectorAll('button, input, select, textarea'), input => {
    input.setAttribute('aria-disabled', 'true');
  });

  // Should we not to disable hyperlink?
  // How about buttons mimic as an hyperlink?
  [].forEach.call(element.querySelectorAll('a'), hyperlink => {
    hyperlink.addEventListener('click', disabledHandler);
  });

  [].forEach.call(element.querySelectorAll('option'), option => {
    option.setAttribute('disabled', 'disabled');
  });

  [].forEach.call(element.querySelectorAll('input, textarea'), input => {
    // Make checkboxes, radioes, etc, readonly.
    input.addEventListener('click', disabledHandler);

    // Disable text inputs, etc.
    input.setAttribute('readonly', 'readonly');
  });

  // TODO: We should look at DOM tree change and disable all inputs in future subtree
  if (observeSubtree) {
    const observer = new MutationObserver(mutations =>
      mutations.forEach(({ addedNodes }) => addedNodes.forEach(addedNode => disableInputElements(addedNode, false)))
    );

    observer.observe(element, { childList: true, subtree: true });
  }
}

function getFocusableElements(element) {
  return [].filter.call(
    element.querySelectorAll(
      [
        'a',
        'body',
        'button',
        'frame',
        'iframe',
        'img',
        'input',
        'isindex',
        'object',
        'select',
        'textarea',
        '[tabindex]'
      ].join(', ')
    ),
    element => {
      const tabIndex = getTabIndex(element);

      return typeof tabIndex === 'number' && tabIndex >= 0;
    }
  );
}

function restoreActiveElementIndex(element, activeElementIndex) {
  const focusable = getFocusableElements(element)[activeElementIndex];

  focusable && focusable.focus();
}

function saveActiveElementIndex(element) {
  return getFocusableElements(element).indexOf(document.activeElement);
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

const AdaptiveCardRenderer = ({ adaptiveCard, disabled: disabledFromProps, tapAction }) => {
  const [{ adaptiveCardRenderer: adaptiveCardRendererStyleSet }] = useStyleSet();
  const [{ HostConfig }] = useAdaptiveCardsPackage();
  const [adaptiveCardsHostConfig] = useAdaptiveCardsHostConfig();
  const [disabledFromComposer] = useDisabled();
  const [error, setError] = useState();
  const activeElementIndexRef = useRef(-1);
  const contentRef = useRef();
  const inputValuesRef = useRef([]);
  const localize = useLocalizer();
  const performCardAction = usePerformCardAction();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const scrollToEnd = useScrollToEnd();

  const disabled = disabledFromComposer || disabledFromProps;

  const handleClick = useCallback(
    ({ target }) => {
      // Some items, e.g. tappable text, cannot be disabled thru DOM attributes
      if (!disabled) {
        const tabIndex = getTabIndex(target);

        // If the user is clicking on something that is already clickable, do not allow them to click the card.
        // E.g. a hero card can be tappable, and image and buttons inside the hero card can also be tappable.
        if (typeof tabIndex !== 'number' || tabIndex < 0) {
          tapAction && performCardAction(tapAction, { target });
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
        performCardAction(
          {
            type: 'openUrl',
            value: action.url
          },
          { target: action }
        );
      } else if (actionTypeName === 'Action.Submit') {
        if (typeof action.data !== 'undefined') {
          const { data: actionData } = action;

          if (actionData && actionData.__isBotFrameworkCardAction) {
            const { cardAction } = actionData;
            const { displayText, text, type, value } = cardAction;

            performCardAction({ displayText, text, type, value }, { target: action });
          } else {
            performCardAction(
              {
                type: typeof action.data === 'string' ? 'imBack' : 'postBack',
                value: action.data
              },
              { target: action }
            );
          }
        }

        scrollToEnd();
      } else {
        console.error(`Web Chat: received unknown action from Adaptive Cards`);
        console.error(action);
      }
    },
    [disabled, performCardAction, scrollToEnd]
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

      disabled && disableInputElements(element, true);
      restoreInputValues(element, inputValuesRef.current);

      const [firstChild] = current.children;

      if (firstChild) {
        current.replaceChild(element, firstChild);
      } else {
        current.appendChild(element);
      }

      // Focus can only be restored after the DOM is attached.
      restoreActiveElementIndex(element, activeElementIndexRef.current);

      // HACK: Remove this line before merge.
      element.removeAttribute('tabindex');

      return () => {
        activeElementIndexRef.current = saveActiveElementIndex(element);
        inputValuesRef.current = saveInputValues(element);
      };
    }

    activeElementIndexRef.current = -1;
    inputValuesRef.current = [];
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
    <ErrorBox error={error} message={localize('ADAPTIVE_CARD_ERROR_BOX_TITLE_RENDER')}>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </ErrorBox>
  ) : (
    <div className={classNames(adaptiveCardRendererStyleSet + '', 'webchat__adaptive-card-renderer')}>
      <div className="webchat__adaptive-card-renderer__content" onClick={handleClick} ref={contentRef} />
      {disabled && <div className="webchat__adaptive-card-renderer__glass" />}
    </div>
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
