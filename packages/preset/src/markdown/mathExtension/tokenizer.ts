/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-invalid-this */
/* eslint-disable no-magic-numbers */
import { BACKSLASH, CLOSE_BRACKET, CLOSE_PAREN, DOLLAR, OPEN_BRACKET, OPEN_PAREN } from './constants';
import { markdownLineEnding, markdownLineEndingOrSpace } from 'micromark-util-character';
import { type Code, type Effects, type State, type Tokenizer, type TokenizeContext } from 'micromark-util-types';

type MathTokenTypes = 'math' | 'mathChunk' | 'mathContent' | 'mathFence';

type MathEffects = Omit<Effects, 'enter' | 'exit'> & {
  enter(type: MathTokenTypes): void;
  exit(type: MathTokenTypes): void;
};

/**
 * Creates a math tokenizer for specified trigger code
 * @param TRIGGER_CODE - Delimiter trigger code
 * @param isInline - True when in inlie parsing mode
 */
export default (TRIGGER_CODE: typeof BACKSLASH | typeof DOLLAR, isInline: boolean) =>
  function createTokenizer(effects: MathEffects, ok: State, nok: State) {
    const self: TokenizeContext = this;

    const OPEN_CODES = TRIGGER_CODE === DOLLAR ? [DOLLAR] : [OPEN_BRACKET, OPEN_PAREN];
    const CLOSE_CODES = TRIGGER_CODE === DOLLAR ? [DOLLAR] : [CLOSE_BRACKET, CLOSE_PAREN];

    let allowSpill: boolean;
    let isDisplay: boolean;

    const closeDelimiterConstruct = { tokenize: closeDelimiterTokenizer as any satisfies Tokenizer };

    function closeDelimiterTokenizer(effects: MathEffects, ok: State, nok: State) {
      return checkCloseTrigger;

      function checkCloseTrigger(code: Code): State {
        if (code !== TRIGGER_CODE) {
          return nok(code);
        }
        effects.consume(code);
        return checkCloseDelimiter;
      }

      function checkCloseDelimiter(code: Code): State {
        if (!CLOSE_CODES.includes(code)) {
          return nok(code);
        }

        effects.consume(code);
        return ok;
      }
    }

    return openTrigger;

    function openTrigger(code: Code): State {
      if (code !== TRIGGER_CODE) {
        return nok(code);
      }

      effects.enter('math');
      effects.enter('mathFence');
      effects.consume(code);

      return openDelimiter;
    }

    function openDelimiter(code: Code): State {
      if (!OPEN_CODES.includes(code)) {
        return nok(code);
      }

      allowSpill = code !== OPEN_PAREN;
      isDisplay = code === OPEN_BRACKET ? true : code === OPEN_PAREN ? false : !isInline;

      effects.consume(code);
      effects.exit('mathFence');
      effects.enter('mathContent');
      effects.enter('mathChunk');

      // Do not convert $$$$ into a formula
      return TRIGGER_CODE === DOLLAR ? effects.check(closeDelimiterConstruct, nok, content) : content;
    }

    function content(code: Code): State {
      // Ignore unclosed formulas when got end of input useful for streaming
      if (code === null) {
        return nok(code);
      }

      if (markdownLineEnding(code)) {
        // Ignore inline formulas which don't have close delimiters if the line ended
        if (isInline && !allowSpill) {
          return nok(code);
        }

        // Allow $$[\n]+$$ math to be rendered as display when multiline
        isDisplay ||= TRIGGER_CODE === DOLLAR;

        return consumeMathChunk(code);
      }

      if (code === TRIGGER_CODE) {
        return effects.check(closeDelimiterConstruct, closeTrigger, consumeContent)(code);
      }

      if (code === BACKSLASH) {
        effects.consume(code);
        return escaped;
      }

      return consumeContent(code);
    }

    function consumeContent(code: Code): State {
      effects.consume(code);
      return content;
    }

    function consumeMathChunk(code: Code): State {
      effects.consume(code);
      effects.exit('mathChunk');
      effects.enter('mathChunk');

      return content;
    }

    function closeTrigger(code: Code): State {
      if (code !== TRIGGER_CODE) {
        return nok(code);
      }

      effects.exit('mathChunk');
      effects.exit('mathContent');
      effects.enter('mathFence');
      effects.consume(code);

      return closeDelimiter;
    }

    function closeDelimiter(code: Code): State {
      if (!CLOSE_CODES.includes(code)) {
        return nok(code);
      }

      effects.consume(code);
      effects.exit('mathFence');
      effects.exit('math');

      const [, token] = self.events.at(-1);
      Object.assign(token, {
        isInline,
        isDisplay
      });

      return TRIGGER_CODE === DOLLAR || isInline ? ok : blockEnding;
    }

    function escaped(code: Code): State {
      // Allow escaping $ and \
      if (code !== DOLLAR && code !== BACKSLASH) {
        return content(code);
      }

      effects.consume(code);
      return content;
    }

    function blockEnding(code: Code): State {
      if (markdownLineEndingOrSpace(code) || code === null) {
        return ok(code);
      }

      return nok(code);
    }
  };
