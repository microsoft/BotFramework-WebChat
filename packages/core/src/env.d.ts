declare global {
  const process: {
    env?: {
      build_tool?: string | undefined;
      module_format?: string | undefined;
      npm_package_version?: string | undefined;
    };
  };

  const clearImmediate: ((timeout: number) => void) | undefined;
  const setImmediate: ((fn: () => void) => number) | undefined;
}

export {};
