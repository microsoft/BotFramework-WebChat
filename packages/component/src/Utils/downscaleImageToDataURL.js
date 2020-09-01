import downscaleImageToDataURLUsingBrowser from './downscaleImageToDataURLUsingBrowser';
import downscaleImageToDataURLUsingWorker, {
  checkSupport as supportWorker
} from './downscaleImageToDataURLUsingWorker';

export default async function downscaleImageToDataURL(blob, maxWidth, maxHeight, type, quality) {
  if (await supportWorker()) {
    return await downscaleImageToDataURLUsingWorker(blob, maxWidth, maxHeight, type, quality);
  }

  return await downscaleImageToDataURLUsingBrowser(blob, maxWidth, maxHeight, type, quality);
}
