import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';

const bundleStyleContent = '@--BUNDLE-STYLES-CONTENT--@';

const createBundleStyleElements = makeCreateStyles(bundleStyleContent);

export default createBundleStyleElements;
export { bundleStyleContent };
