import root from './root';

export default function uploadButton() {
  return root().querySelector('.webchat__upload-button--file-input') || document.querySelector('input[type="file"]');
}
