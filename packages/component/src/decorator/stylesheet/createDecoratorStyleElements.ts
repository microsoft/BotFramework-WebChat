import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';

const decoratorCSSContent = '@--DECORATOR-STYLES-CONTENT--@';

const createDecoratorStyleElements = makeCreateStyles(decoratorCSSContent);

export default createDecoratorStyleElements;
export { decoratorCSSContent };
