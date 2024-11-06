/* eslint-disable @typescript-eslint/no-use-before-define */
import { BACKSLASH, OPEN_PAREN, CLOSE_PAREN, OPEN_BRACKET, CLOSE_BRACKET } from './constants';
import { markdownLineEnding } from 'micromark-util-character';
import { type Code, type Effects, type State } from 'micromark-util-types';

type MathTokenTypes = 'math' | 'mathChunk';

type MathEffects = Omit<Effects, 'enter' | 'exit'> & {
  enter(type: MathTokenTypes): void;
  exit(type: MathTokenTypes): void;
};

export function createTokenizer(effects: MathEffects, ok: State, nok: State) {
  let isDisplay = false;

  return start;

  function start(code: Code): State {
    if (code !== BACKSLASH) {
      return nok(code);
    }
    effects.enter('math');
    effects.consume(code);
    return openDelimiter;
  }

  function openDelimiter(code: Code): State {
    if (code === OPEN_PAREN || code === OPEN_BRACKET) {
      isDisplay = code === OPEN_BRACKET;
      effects.consume(code);
      effects.enter('mathChunk');
      return content;
    }
    return nok(code);
  }

  function content(code: Code): State {
    if (code === null) {
      return nok(code);
    }

    if (code === BACKSLASH) {
      effects.consume(code);
      return escaped;
    }

    effects.consume(code);

    if (markdownLineEnding(code)) {
      effects.exit('mathChunk');
      effects.enter('mathChunk');
    }

    return content;
  }

  function escaped(code) {
    if ((!isDisplay && code === CLOSE_PAREN) || (isDisplay && code === CLOSE_BRACKET)) {
      effects.consume(code);
      effects.exit('mathChunk');
      effects.exit('math');
      return ok(code);
    }

    effects.consume(code);
    return content;
  }
}
