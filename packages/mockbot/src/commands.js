import AnimationCard from './commands/AnimationCard';
import Audio from './commands/Audio';
import AudioCard from './commands/AudioCard';
import Carousel from './commands/Carousel';
import DocumentPlain from './commands/DocumentPlain';
import DocumentWord from './commands/DocumentWord';
import EmptyCard from './commands/EmptyCard';
import HeroCard from './commands/HeroCard';
import Image from './commands/Image';
import ImageSVG from './commands/ImageSVG';
import Markdown from './commands/Markdown';
import MultimediaCard from './commands/MultimediaCard';
import OAuthCard from './commands/OAuthCard';
import SignInCard from './commands/SignInCard';

export default [
  { pattern: 'animationcard', processor: AnimationCard },
  { pattern: 'audio', processor: Audio },
  { pattern: 'audiocard', processor: AudioCard },
  { pattern: 'carousel', processor: Carousel },
  { pattern: 'document-plain', processor: DocumentPlain },
  { pattern: 'document-word', processor: DocumentWord },
  { pattern: 'emptycard', processor: EmptyCard },
  { pattern: 'herocard', processor: HeroCard },
  { pattern: 'image', processor: Image },
  { pattern: 'image-svg', processor: ImageSVG },
  { pattern: 'markdown', processor: Markdown },
  { pattern: 'content-multimedia', processor: MultimediaCard },
  { pattern: 'oauth', processor: OAuthCard },
  { pattern: 'signin', processor: SignInCard }
].map(({ pattern, processor }) => ({
  pattern: typeof pattern === 'string' ? new RegExp(`^${ pattern }$`, 'i') : pattern,
  processor
}))
