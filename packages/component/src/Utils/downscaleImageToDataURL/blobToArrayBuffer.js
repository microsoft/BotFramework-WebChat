export default function blobToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = ({ error, message }) => reject(error || new Error(message));
    reader.onloadend = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });
}
