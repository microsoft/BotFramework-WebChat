export default function once(fn: () => void): () => void {
  let done;

  return () => {
    if (!done) {
      fn();
      done = 1;
    }
  };
}
