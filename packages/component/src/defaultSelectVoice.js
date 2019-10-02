export default function({ language }, voices, activity) {
  // Find the first voice based on this order:
  // 1. Voice with language same as locale as defined in the activity
  // 2. Voice with language same as locale as passed into Web Chat
  // 3. Voice with language same as browser
  // 4. English (United States)
  // 5. First voice

  // We also prioritize voices powered by deep neural network (with keyword "neural" in the voice name).
  return (
    [activity.locale, language, window.navigator.language, 'en-US'].reduce(
      (result, targetLanguage) =>
        result ||
        voices.find(({ lang, name }) => lang === targetLanguage && /neural/iu.test(name)) ||
        voices.find(({ lang }) => lang === targetLanguage),
      null
    ) || voices[0]
  );
}
