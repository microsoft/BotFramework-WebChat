export default function negationOf({ message, fn }) {
  return {
    fn: async (...args) => !(await fn(...args)),
    message: `negation of ${message || 'a condition'}`
  };
}
