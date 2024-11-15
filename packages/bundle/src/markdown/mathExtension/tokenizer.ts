/* eslint-disable @typescript-eslint/no-use-before-define */
import { BACKSLASH, OPEN_PAREN, CLOSE_PAREN, OPEN_BRACKET, CLOSE_BRACKET, DOLLAR } from './constants';
import { markdownLineEnding } from 'micromark-util-character';
import { type Code, type Effects, type State } from 'micromark-util-types';

type MathTokenTypes = 'math' | 'mathChunk';

type OpenCode = typeof OPEN_BRACKET | typeof OPEN_PAREN | typeof DOLLAR;
type CloseCode = typeof CLOSE_BRACKET | typeof CLOSE_PAREN | typeof DOLLAR;

type MathEffects = Omit<Effects, 'enter' | 'exit'> & {
  enter(type: MathTokenTypes): void;
  exit(type: MathTokenTypes): void;
};

/**
 * Creates a math tokenizer for specified delimiter pair
 * @param OPEN_CODE - Opening delimiter code
 * @param CLOSE_CODE - Closing delimiter code
 */
export default ({ OPEN_CODE, CLOSE_CODE }: { OPEN_CODE: OpenCode; CLOSE_CODE: CloseCode }) =>
  function createTokenizer(effects: MathEffects, ok: State, nok: State) {
    return start;

    function start(code: Code): State {
      if (code === BACKSLASH || (code === DOLLAR && OPEN_CODE === DOLLAR)) {
        effects.enter('math');
        effects.enter('mathChunk');
        effects.consume(code);
        return openDelimiter;
      }

      return nok(code);
    }

    function openDelimiter(code: Code): State {
      if (code !== OPEN_CODE) {
        return nok(code);
      }

      effects.consume(code);
      return content;
    }

    function content(code: Code): State {
      if (code === null) {
        return nok(code);
      }

      if (code === BACKSLASH || (CLOSE_CODE === DOLLAR && code === DOLLAR)) {
        effects.consume(code);
        return maybeCloseDelimiter;
      }

      effects.consume(code);

      if (markdownLineEnding(code)) {
        effects.exit('mathChunk');
        effects.enter('mathChunk');
      }

      return content;
    }

    function maybeCloseDelimiter(code: Code): State {
      if (code === CLOSE_CODE) {
        effects.consume(code);
        effects.exit('mathChunk');
        effects.exit('math');
        return ok;
      }

      return content(code);
    }
  };
