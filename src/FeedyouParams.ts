const feedyouParams: Record<string, any> = {};

export function setFeedyouParam(name: string, value: string) {
  feedyouParams[name] = value;
}

export function getFeedyouParam(name: string) {
  return feedyouParams[name];
}
