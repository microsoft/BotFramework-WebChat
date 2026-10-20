/* eslint-disable react/no-array-index-key */
/* eslint-disable react/forbid-dom-props */
import { hooks } from 'botframework-webchat-component';
import { htmlTextAlternatives } from 'botframework-webchat-component/internal.js';
import { onErrorResumeNext } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import setMarkdownEngine from '../Attachment/private/setMarkdownEngine';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import useParseAdaptiveCardJSON from '../hooks/internal/useParseAdaptiveCardJSON';
import useUniqueId from '../hooks/internal/useUniqueId';

const { useLocalizer, useRenderMarkdownAsHTML } = hooks;

// Returns the text as the visible card shows it: Adaptive Cards formats {{DATE()}} and {{TIME()}}, then renders the Markdown.
// Images are read by their alt text and blocks are separated, as in the live region of message text.
// If the Markdown engine or Adaptive Cards throws, the visible card shows an error, and the text is read as written.
function getRenderedText(element) {
  return onErrorResumeNext(() => {
    const renderedElement = element.render();

    // Plain text, such as a TextRun, is set with innerText, which renders line breaks as <br>; htmlTextAlternatives() reads <br> as nothing.
    renderedElement?.querySelectorAll('br').forEach(br => br.replaceWith('\n'));

    return renderedElement ? htmlTextAlternatives(renderedElement).join('').replace(/\s+/gu, ' ').trim() : '';
  }, element.asString());
}

// Facts are rendered as text blocks, as Adaptive Cards does.
function getFactText(TextBlock, factSet, text) {
  const textBlock = new TextBlock(text);

  textBlock.setParent(factSet);

  return getRenderedText(textBlock);
}

// Perform a depth-first search of the visible elements of the Adaptive Card tree, skipping hidden subtrees.
// Actions are visited but not walked into, so the card of Action.ShowCard, hidden until opened, is not visited.
function walkAllItems(node, fn) {
  if (node.isVisible) {
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
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('adaptive cards');
  const [
    {
      ChoiceSetInput,
      DateInput,
      FactSet,
      Image,
      NumberInput,
      OpenUrlAction,
      RichTextBlock,
      ShowCardAction,
      SubmitAction,
      TextBlock,
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

  // Without `speak`, the card is described by its visible text, in document order. Inputs and actions are listed separately below.
  const text = useMemo(() => {
    const nodes = [];

    walkAllItems(card, node => nodes.push(node));

    // Same Markdown engine as the visible card.
    setMarkdownEngine(card, renderMarkdownAsHTML);

    return nodes
      .flatMap(node =>
        node instanceof FactSet
          ? node.facts.map(({ name, value }) =>
              [getFactText(TextBlock, node, name), getFactText(TextBlock, node, value)].filter(Boolean).join(': ')
            )
          : node instanceof Image
            ? [node.altText]
            : node instanceof RichTextBlock || node instanceof TextBlock
              ? [getRenderedText(node)]
              : []
      )
      .filter(Boolean)
      .join(' ');
  }, [card, FactSet, Image, renderMarkdownAsHTML, RichTextBlock, TextBlock]);

  const cardLabel = localize('ATTACHMENT_CARD', card.speak || text, '', '');

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
