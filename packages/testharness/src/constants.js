const imageSnapshotOptions = {
  customDiffConfig: {
    threshold: 0.14
  }
};

const timeouts = {
  directLine: 15000,
  fetch: 2500,
  fetchImage: 5000,
  navigation: 10000,
  postActivity: 30000,
  scrollToBottom: 5000,
  ui: 1000
};

export { imageSnapshotOptions, timeouts };
