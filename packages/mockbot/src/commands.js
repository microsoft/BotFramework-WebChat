import Audio from './commands/Audio';
import HeroCard from './commands/HeroCard';
import Markdown from './commands/Markdown';

export default [
  { pattern: 'audio', processor: Audio },
  { pattern: 'herocard', processor: HeroCard },
  { pattern: 'markdown', processor: Markdown }
].map(({ pattern, processor }) => ({
  pattern: typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern,
  processor
}))
