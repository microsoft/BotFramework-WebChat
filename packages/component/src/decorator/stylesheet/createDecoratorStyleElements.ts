import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';

const decoratorStyleContent = '@--DECORATOR-STYLES-CONTENT--@';

const createDecoratorStyleElements = makeCreateStyles(decoratorStyleContent);

export default createDecoratorStyleElements;
export { decoratorStyleContent };
