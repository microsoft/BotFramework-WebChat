export default function once<P extends any[]>(fn: (...args: P) => void): (...args: P) => void {
  let done = false;

  return (...args) => {
    if (!done) {
      fn(...args);
      done = true;
    }
  };
}
