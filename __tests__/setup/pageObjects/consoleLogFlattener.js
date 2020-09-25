export default function consoleLogFlattener(level) {
  return (accumulator, [type, msg]) => (type === level ? accumulator.concat([msg]) : accumulator);
}
