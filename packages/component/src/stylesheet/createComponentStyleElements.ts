import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';

const componentStyleContent = '@--COMPONENT-STYLES-CONTENT--@';

const createComponentStyleElements = makeCreateStyles(componentStyleContent);

export default createComponentStyleElements;
export { componentStyleContent };
