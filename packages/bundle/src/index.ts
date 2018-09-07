import createDirectLine from './createDirectLine';
import renderWebChat from './renderWebChat';

export default renderWebChat

export {
  createDirectLine
}

window['WebChat'] = {
  ...window['WebChat'],
  createDirectLine,
  renderWebChat
};
