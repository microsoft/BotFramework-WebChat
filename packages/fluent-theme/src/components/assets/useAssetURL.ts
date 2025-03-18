import { type AssetName } from './AssetName';
import useContext from './private/useContext';

export default function useAssetURL(assetName: AssetName): URL {
  const url = useContext().urlMap.get(assetName);

  if (!url) {
    throw new Error(`botframework-webchat-fluent-theme internal: Asset "${assetName}" was not found.`);
  }

  return url;
}
