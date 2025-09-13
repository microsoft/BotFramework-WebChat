import buildInfo from '../buildInfo';

buildInfo.set('variant', 'full');

import { ReactWebChat } from '../full';

export * from '../full';
export { buildInfo };
export default ReactWebChat;
