import PrecompiledGlobalize from '../Utils/PrecompiledGlobalize';

export default function getLocaleString(value, language) {
  const globalize = PrecompiledGlobalize(language);

  return globalize.dateFormatter({ skeleton: 'MMMMdhm' })(new Date(value));
}
