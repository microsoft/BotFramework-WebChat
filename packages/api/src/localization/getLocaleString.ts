import PrecompiledGlobalize from '../../lib/external/PrecompiledGlobalize';

export default function getLocaleString(date: Date | number | string, language: string) {
  const globalize = PrecompiledGlobalize(language);

  return globalize.dateFormatter({ skeleton: 'MMMMdhm' })(new Date(date));
}
