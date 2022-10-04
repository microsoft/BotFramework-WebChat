import transcriptLiveRegion from '../pageElements/transcriptLiveRegion';

export default function observeLiveRegion() {
  const liveRegionElement = transcriptLiveRegion();
  const liveRegionInnerTexts = [];

  const mutationObserver = new MutationObserver(records => {
    liveRegionInnerTexts.push(
      ...[].reduce.call(
        records,
        (addedInnerTexts, record) =>
          [].reduce.call(
            record.addedNodes,
            (addedInnerTexts, { innerText }) => [...addedInnerTexts, innerText],
            addedInnerTexts
          ),
        []
      )
    );
  });

  mutationObserver.observe(liveRegionElement, { childList: true });

  return {
    disconnect: () => mutationObserver.disconnect(),
    flush: () => liveRegionInnerTexts.splice(0),
    getInnerTexts: () => Object.freeze([...liveRegionInnerTexts])
  };
}
