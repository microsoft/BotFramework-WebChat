declare global {
  const host: any;
  const pageConditions: any;
  const pageElements: any;
  const run: (fn: () => Promise<void>) => Promise<void>;
  const testHelpers: any;
}

export {};
