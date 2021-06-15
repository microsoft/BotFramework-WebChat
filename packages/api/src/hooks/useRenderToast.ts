import { RenderToast } from '../types/ToastMiddleware';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useRenderToast(): RenderToast {
  return useWebChatAPIContext().toastRenderer;
}
