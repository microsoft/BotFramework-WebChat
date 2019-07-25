export default function getLocaleString(value, language) {
  const date = new Date(value);
  const options = {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'long'
  };

  if (window.Intl) {
    return !!date && new Intl.DateTimeFormat('en-US', options).format(date);
  }
  return date.toLocaleDateString(language, options);
}
