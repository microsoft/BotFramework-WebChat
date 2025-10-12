import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';

const fluentStyleContent = '@--FLUENT-STYLES-CONTENT--@';

const createFluentThemeStyleElements = makeCreateStyles(fluentStyleContent);

export default createFluentThemeStyleElements;
export { fluentStyleContent };
