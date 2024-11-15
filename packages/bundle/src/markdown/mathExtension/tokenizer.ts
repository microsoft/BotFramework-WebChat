/* eslint-disable @typescript-eslint/no-use-before-define */
import { BACKSLASH, OPEN_PAREN, CLOSE_PAREN, OPEN_BRACKET, CLOSE_BRACKET, DOLLAR } from './constants';
import { markdownLineEnding, markdownLineEndingOrSpace } from 'micromark-util-character';
import { type Code, type Effects, type State } from 'micromark-util-types';

type MathTokenTypes = 'math' | 'mathChunk';

type MathEffects = Omit<Effects, 'enter' | 'exit'> & {
  enter(type: MathTokenTypes): void;
  exit(type: MathTokenTypes): void;
};

/**
 * Creates a math tokenizer for specified trigger code
 * @param TRIGGER_CODE - Delimiter trigger code
 */
export default (TRIGGER_CODE: typeof BACKSLASH | typeof DOLLAR) =>
  function createTokenizer(effects: MathEffects, ok: State, nok: State) {
    const OPEN_CODES = TRIGGER_CODE === DOLLAR ? [DOLLAR] : [OPEN_PAREN, OPEN_BRACKET];
    const CLOSE_CODES = TRIGGER_CODE === DOLLAR ? [DOLLAR] : [CLOSE_PAREN, CLOSE_BRACKET];
    let isInline: boolean;

    return start;

    function start(code: Code): State {
      if (code === TRIGGER_CODE) {
        effects.enter('math');
        effects.enter('mathChunk');
        effects.consume(code);
        return openDelimiter;
      }

      return nok(code);
    }

    function openDelimiter(code: Code): State {
      if (OPEN_CODES.includes(code)) {
        isInline = code === OPEN_PAREN;
        effects.consume(code);
        return content;
      }

      return nok(code);
    }

    function content(code: Code): State {
      if (code === null) {
        return nok(code);
      }

      if (code === TRIGGER_CODE) {
        effects.consume(code);
        return closeDelimiter;
      }

      if (code === BACKSLASH) {
        effects.consume(code);
        return escaped;
      }

      if (markdownLineEnding(code)) {
        return isInline ? ending(code) : mathChunk(code);
      }

      effects.consume(code);
      return content;
    }

    function escaped(code: Code): State {
      if (code === DOLLAR) {
        effects.consume(code);
        return content;
      }
      return content(code);
    }

    function closeDelimiter(code: Code): State {
      if (CLOSE_CODES.includes(code)) {
        effects.consume(code);
        return ending;
      }

      return content(code);
    }

    function mathChunk(code: Code): State {
      effects.consume(code);
      effects.exit('mathChunk');
      effects.enter('mathChunk');
      return content;
    }

    function ending(code: Code): State {
      if (markdownLineEndingOrSpace(code) || code === null || isInline) {
        effects.exit('mathChunk');
        effects.exit('math');
        return ok(code);
      }
      return nok(code);
    }
  };
