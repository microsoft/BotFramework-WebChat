/* eslint-disable react/no-array-index-key */
/* eslint-disable react/forbid-dom-props */
import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import useParseAdaptiveCardJSON from '../hooks/internal/useParseAdaptiveCardJSON';
import useUniqueId from '../hooks/internal/useUniqueId';

const { useLocalizer } = hooks;

// Perform a depth-first search of the Adaptive Card tree.
function walkAllItems(node, fn) {
  fn(node);

  if (node.getItemAt && node.getItemCount) {
    for (let count = node.getItemCount(), index = 0; index < count; index++) {
      walkAllItems(node.getItemAt(index), fn);
    }
  }

  if (node.getActionAt && node.getActionCount) {
    for (let count = node.getActionCount(), index = 0; index < count; index++) {
      fn(node.getActionAt(index));
    }
  }
}

const AdaptiveCardChoiceSetInput = ({ input: { choices, defaultValue, label } }) => {
  const labelId = useUniqueId('webchat__id');
  const defaultChoice = choices.find(({ value }) => defaultValue === value || (!defaultValue && !value));

  return (
    <div>
      <select
        aria-label={label}
        aria-labelledby={!label && defaultChoice ? labelId : undefined}
        defaultValue={defaultValue}
        tabIndex={-1}
      >
        {choices.map(choice => (
          <option id={!label && choice === defaultChoice ? labelId : undefined} key={choice.value} value={choice.value}>
            {choice.title}
          </option>
        ))}
      </select>
    </div>
  );
};

AdaptiveCardChoiceSetInput.propTypes = {
  input: PropTypes.shape({
    choices: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        value: PropTypes.any
      })
    ),
    defaultValue: PropTypes.any,
    label: PropTypes.string,
    value: PropTypes.any
  }).isRequired
};

const AdaptiveCardAttachment = ({ content }) => {
  const localize = useLocalizer();
  const parseAdaptiveCardJSON = useParseAdaptiveCardJSON();
  const [
    {
      ChoiceSetInput,
      DateInput,
      NumberInput,
      OpenUrlAction,
      ShowCardAction,
      SubmitAction,
      TextInput,
      TimeInput,
      ToggleInput
    }
  ] = useAdaptiveCardsPackage();

  const card = useMemo(() => parseAdaptiveCardJSON(content, { ignoreErrors: true }), [content, parseAdaptiveCardJSON]);
  const inputs = useMemo(() => {
    const inputs = [];

    walkAllItems(card, node => {
      if (
        node instanceof ChoiceSetInput ||
        node instanceof DateInput ||
        node instanceof NumberInput ||
        node instanceof OpenUrlAction ||
        node instanceof ShowCardAction ||
        node instanceof SubmitAction ||
        node instanceof TextInput ||
        node instanceof TimeInput ||
        node instanceof ToggleInput
      ) {
        inputs.push(node);
      }
    });

    return inputs;
  }, [
    card,
    ChoiceSetInput,
    DateInput,
    NumberInput,
    OpenUrlAction,
    ShowCardAction,
    SubmitAction,
    TextInput,
    TimeInput,
    ToggleInput
  ]);

  const cardLabel = localize('ATTACHMENT_CARD', card.speak || '', '', '');

  return (
    <article>
      <div>{cardLabel}</div>
      {inputs.map((input, index) =>
        input instanceof ChoiceSetInput ? (
          <AdaptiveCardChoiceSetInput input={input} key={index} />
        ) : input instanceof DateInput ? (
          <label key={index}>
            {input.title}
            <input placeholder={input.placeholder} tabIndex={-1} type="date" />
          </label>
        ) : input instanceof NumberInput ? (
          <label key={index}>
            {input.title}
            <input placeholder={input.placeholder} tabIndex={-1} type="number" />
          </label>
        ) : input instanceof OpenUrlAction || input instanceof ShowCardAction || input instanceof SubmitAction ? (
          <div key={index}>
            <button tabIndex={-1} type="button">
              {input.title}
            </button>
          </div>
        ) : input instanceof TextInput ? (
          <label key={index}>
            {input.title}
            <input placeholder={input.placeholder} tabIndex={-1} type="text" />
          </label>
        ) : input instanceof TimeInput ? (
          <label key={index}>
            {input.title}
            <input placeholder={input.placeholder} tabIndex={-1} type="time" />
          </label>
        ) : input instanceof ToggleInput ? (
          <label key={index}>
            {input.title}
            <input defaultChecked={input.value === input.valueOn} tabIndex={-1} type="checkbox" />
          </label>
        ) : (
          false
        )
      )}
    </article>
  );
};

AdaptiveCardAttachment.propTypes = {
  content: PropTypes.any.isRequired
};

export default AdaptiveCardAttachment;
