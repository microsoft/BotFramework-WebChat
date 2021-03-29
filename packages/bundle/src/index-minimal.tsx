import { StyleOptions } from 'botframework-webchat-api';
import ReactWebChat, { Components } from 'botframework-webchat-component';

/** Creates a set of styles */
declare function createStyleSet(styleOptions: StyleOptions): any;

export default ReactWebChat;
export { Components, createStyleSet };
export type { StyleOptions };
