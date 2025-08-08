/// <reference types="@msinternal/botframework-webchat-styles/env" />

declare global {
  const process: {
    env?: {
      build_tool?: string | undefined;
      module_format?: string | undefined;
      node_env?: string | undefined;
      NODE_ENV?: string | undefined;
      npm_package_version?: string | undefined;
    };
  };
}

export {};
