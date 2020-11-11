const bubbleStyleOptions = [
  { key: 'false', text: 'Default style' },
  { key: 'true', text: 'Style bubble border' }
];

const dirOptions = [
  { key: 'auto', text: 'Auto (default)' },
  { key: 'ltr', text: 'Left to Right' },
  { key: 'rtl', text: 'Right to left' }
];

const groupTimestampOptions = [
  { key: 'true', text: 'Show timestamp (default)' },
  { key: 'false', text: "Don't show timestamp" },
  { key: 0, text: "Don't group" },
  { key: 1000, text: '1 second' },
  { key: 2000, text: '2 seconds' },
  { key: 5000, text: '5 seconds' },
  { key: 10000, text: '10 seconds' },
  { key: 60000, text: 'One minute' },
  { key: 300000, text: '5 minutes' },
  { key: 3600000, text: 'One hour' }
];

const localeOptions = [
  { key: 'ar-SA', text: 'Arabic (Saudi Arabia)' },
  { key: 'eu-ES', text: 'Basque' },
  { key: 'bg-BG', text: 'Bulgarian' },
  { key: 'ca-ES', text: 'Catalan' },
  { key: 'yue', text: 'Cantonese' },
  { key: 'zh-Hans', text: 'Chinese (Simplified)' },
  { key: 'zh-Hant', text: 'Chinese (Traditional)' },
  { key: 'hr-HR', text: 'Croatian' },
  { key: 'cs-CZ', text: 'Czech' },
  { key: 'da-DK', text: 'Danish' },
  { key: 'nl-NL', text: 'Dutch' },
  { key: 'ar-EG', text: 'Egyptian Arabic' },
  { key: 'en-US', text: 'English' },
  { key: 'et-EE', text: 'Estonian' },
  { key: 'fi-FI', text: 'Finnish' },
  { key: 'fr-FR', text: 'French' },
  { key: 'gl-ES', text: 'Galician' },
  { key: 'de-DE', text: 'German' },
  { key: 'el-GR', text: 'Greek' },
  { key: 'he-IL', text: 'Hebrew' },
  { key: 'hi-IN', text: 'Hindi' },
  { key: 'hu-HU', text: 'Hungarian' },
  { key: 'id-ID', text: 'Indonesian' },
  { key: 'it-IT', text: 'Italian' },
  { key: 'ja-JP', text: 'Japanese' },
  { key: 'ar-JO', text: 'Jordanian Arabic' },
  { key: 'kk-KZ', text: 'Kazakh' },
  { key: 'ko-kr', text: 'Korean' },
  { key: 'lv-LV', text: 'Latvian' },
  { key: 'lt-LT', text: 'Lithuanian' },
  { key: 'ms-MY', text: 'Malay' },
  { key: 'nb-NO', text: 'Norwegian (Bokmål)' },
  { key: 'pl-PL', text: 'Polish' },
  { key: 'pt-BR', text: 'Portuguese (Brazil)' },
  { key: 'pt-PT', text: 'Portuguese (Portugal)' },
  { key: 'ro-RO', text: 'Romanian' },
  { key: 'ru-RU', text: 'Russian' },
  { key: 'sr-Cyrl', text: 'Serbian (Cyrillic)' },
  { key: 'sr-Latn', text: 'Serbian (Latin)' },
  { key: 'sk-SK', text: 'Slovak' },
  { key: 'sl-SI', text: 'Slovenian' },
  { key: 'es-ES', text: 'Spanish' },
  { key: 'sv-SE', text: 'Swedish' },
  { key: 'th-TH', text: 'Thai' },
  { key: 'tr-TR', text: 'Turkish' },
  { key: 'uk-UA', text: 'Ukrainian' },
  { key: 'vi-VN', text: 'Vietnamese' }
];

const messageActivityWordBreakOptions = [
  { key: 'break-word', text: 'Break word (default)' },
  { key: 'normal', text: 'Normal' },
  { key: 'break-all', text: 'Break all' },
  { key: 'keep-all', text: 'Keep all' }
];

const sendTimeoutOptions = [
  { key: '1000', text: '1 second' },
  { key: '2000', text: '2 seconds' },
  { key: '5000', text: '5 seconds' },
  { key: '20000', text: '20 seconds (default)' },
  { key: '60000', text: '1 minute' },
  { key: '120000', text: '2 minutes' },
  { key: '300000', text: '5 minutes (> browser timeout)' }
];

const speechOptions = [
  { key: false, text: 'Disabled (default)' },
  { key: 'speechservices', text: 'Speech services' },
  { key: 'webspeech', text: 'Web speech' }
];

export {
  bubbleStyleOptions,
  dirOptions,
  groupTimestampOptions,
  localeOptions,
  messageActivityWordBreakOptions,
  sendTimeoutOptions,
  speechOptions
};
