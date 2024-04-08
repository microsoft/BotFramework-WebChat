import downscaleImageToDataURLUsingBrowser from './downscaleImageToDataURLUsingBrowser';
import downscaleImageToDataURLUsingWorker, {
  checkSupport as supportWorker
} from './downscaleImageToDataURLUsingWorker';

export default async function downscaleImageToDataURL(
  blob: Blob | File,
  maxWidth: number,
  maxHeight: number,
  type: string,
  quality: number
): Promise<URL> {
  if (await supportWorker()) {
    return downscaleImageToDataURLUsingWorker(blob, maxWidth, maxHeight, type, quality);
  }

  return downscaleImageToDataURLUsingBrowser(blob, maxWidth, maxHeight, type, quality);
}
