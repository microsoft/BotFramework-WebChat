/// <reference types="@msinternal/botframework-webchat-styles/env" />

// For adding things to `globalThis`, TypeScript need `var`, not `const` or `let`.
/* eslint-disable no-var */
declare global {
  var WEB_CHAT_BUILD_INFO_BUILD_TOOL: string | undefined;
  var WEB_CHAT_BUILD_INFO_MODULE_FORMAT: string | undefined;
  var WEB_CHAT_BUILD_INFO_VERSION: string | undefined;
}

export {};
