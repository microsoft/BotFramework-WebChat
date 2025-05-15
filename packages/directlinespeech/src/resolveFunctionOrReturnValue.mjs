export default function resolveFunctionOrReturnValue(fnOrValue) {
  return typeof fnOrValue === 'function' ? fnOrValue() : fnOrValue;
}
