export default function uploadButton() {
  return document.querySelector('.webchat__upload-button--file-input') || document.querySelector('input[type="file"]');
}
