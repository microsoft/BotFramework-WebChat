import PrecompiledGlobalize from '../external/PrecompiledGlobalize';

export default function getLocaleString(value, language) {
  const globalize = PrecompiledGlobalize(language);

  return globalize.dateFormatter({ skeleton: 'MMMMdhm' })(new Date(value));
}
