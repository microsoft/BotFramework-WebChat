/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

export default function getLocaleString(value, language) {
  const date = new Date(value);
  const options = {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'long'
  };

  try {
    if (window.Intl) {
      return !!date && new Intl.DateTimeFormat(language, options).format(date);
    }
  } catch (err) {}

  try {
    return date.toLocaleDateString(language, options);
  } catch (err) {}

  // Fallback to en-US if failed, for example, invalid language code would throw exception

  return date.toLocaleDateString('en-US', options);
}
