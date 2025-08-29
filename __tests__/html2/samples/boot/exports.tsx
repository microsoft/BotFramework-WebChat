declare global {
  const expect: any;
}

// Use code-splitting to speed up development time, just dummy import is sufficient.
// esbuild will split out botframework-webchat* packages into their own chunks.
await import('botframework-webchat');

import ReactWebChat, {
  buildInfo,
  Components,
  concatMiddleware,
  Constants,
  createBrowserWebSpeechPonyfillFactory,
  decorator
} from 'botframework-webchat';
import { activityComponent } from 'botframework-webchat/middleware';

run(() => {
  // THEN: It should have "ReactWebChat".
  expect(ReactWebChat).toEqual(expect.any(Function));

  // THEN: It should have bits from "core" package.
  expect(Constants).toEqual(expect.any(Object));

  // THEN: It should have bits from "api" package.
  expect(concatMiddleware).toEqual(expect.any(Function));

  // THEN: It should have bits from "api/decorator" package.
  expect(decorator).toEqual(expect.any(Object));
  expect(decorator.ActivityGroupingDecorator).toEqual(expect.any(Object));

  // THEN: It should have bits from "api/middleware" package.
  expect(activityComponent).toEqual(expect.any(Function));

  // THEN: It should have bits from "component" package.
  expect(Components).toEqual(expect.any(Object));
  expect(Components.BasicWebChat).toEqual(expect.any(Object));

  // THEN: It should have bits from "component/decorator" package.
  expect(decorator.BorderFlair).toEqual(expect.any(Object));

  // THEN: It should have bits from "bundle/minimal" package.
  expect(createBrowserWebSpeechPonyfillFactory).toEqual(expect.any(Function));

  // THEN: It should have bits from "bundle/full" package.
  expect(Components.AdaptiveCardContent).toEqual(expect.any(Object));

  // THEN: `buildInfo.moduleFromat` should be "esmodules".
  expect(buildInfo).toHaveProperty('moduleFormat', 'esmodules'); // Bundle

  // THEN: `buildInfo.variant` should be "full".
  expect(buildInfo).toHaveProperty('variant', 'full');

  return Promise.resolve();
});
