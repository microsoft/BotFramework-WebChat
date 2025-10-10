import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';

const componentCSSContent = '@--COMPONENT-STYLES-CONTENT--@';

const createComponentStyleElements = makeCreateStyles(componentCSSContent);

export default createComponentStyleElements;
export { componentCSSContent };
