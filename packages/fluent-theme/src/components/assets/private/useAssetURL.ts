import { type AssetName } from '../AssetName';
import useContext from './useContext';

export default function useAssetURL(assetName: AssetName): readonly [URL] {
  const urlState = useContext().urlStateMap.get(assetName);

  if (!urlState) {
    throw new Error(`botframework-webchat-fluent-theme internal: Asset "${assetName}" was not found.`);
  }

  return urlState;
}
