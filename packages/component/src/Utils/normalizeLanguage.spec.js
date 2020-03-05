import normalizeLanguage from './normalizeLanguage';

test('"ar-EG"', () => {
  expect(normalizeLanguage('ar-EG')).toBe('ar-EG');
});

test('"ar-jo"', () => {
  expect(normalizeLanguage('ar-JO')).toBe('ar-JO');
});

test('"ar*"', () => {
  expect(normalizeLanguage('ar*')).toBe('ar-SA');
});

test('"bg*"', () => {
  expect(normalizeLanguage('bg*')).toBe('bg-BG');
});

test('"ca*"', () => {
  expect(normalizeLanguage('ca*')).toBe('ca-ES');
});

test('"cs*"', () => {
  expect(normalizeLanguage('cs*')).toBe('cs-CZ');
});

test('"da*"', () => {
  expect(normalizeLanguage('da*')).toBe('da-DK');
});

test('"de*"', () => {
  expect(normalizeLanguage('de*')).toBe('de-DE');
});

test('"el*"', () => {
  expect(normalizeLanguage('el*')).toBe('el-GR');
});

test('"es*"', () => {
  expect(normalizeLanguage('es*')).toBe('es-ES');
});

test('"et*"', () => {
  expect(normalizeLanguage('et*')).toBe('et-EE');
});

test('"eu*"', () => {
  expect(normalizeLanguage('eu*')).toBe('eu-ES');
});

test('"fi*"', () => {
  expect(normalizeLanguage('fi*')).toBe('fi-FI');
});

test('"fr*"', () => {
  expect(normalizeLanguage('fr*')).toBe('fr-FR');
});

test('"gl*"', () => {
  expect(normalizeLanguage('gl*')).toBe('gl-ES');
});

test('"he*"', () => {
  expect(normalizeLanguage('he*')).toBe('he-IL');
});

test('"hi*"', () => {
  expect(normalizeLanguage('hi*')).toBe('hi-IN');
});

test('"hr*"', () => {
  expect(normalizeLanguage('hr*')).toBe('hr-HR');
});

test('"hu*"', () => {
  expect(normalizeLanguage('hu*')).toBe('hu-HU');
});

test('"id*"', () => {
  expect(normalizeLanguage('id*')).toBe('id-ID');
});

test('"it*"', () => {
  expect(normalizeLanguage('it*')).toBe('it-IT');
});

test('"ja*"', () => {
  expect(normalizeLanguage('ja*')).toBe('ja-JP');
});

test('"kk*"', () => {
  expect(normalizeLanguage('kk*')).toBe('kk-KZ');
});

test('"ko*"', () => {
  expect(normalizeLanguage('ko*')).toBe('ko-KR');
});

test('"lt*"', () => {
  expect(normalizeLanguage('lt*')).toBe('lt-LT');
});

test('"lv*"', () => {
  expect(normalizeLanguage('lv*')).toBe('lv-LV');
});

test('"ms*"', () => {
  expect(normalizeLanguage('ms*')).toBe('ms-MY');
});

test('"nb*"', () => {
  expect(normalizeLanguage('nb*')).toBe('nb-NO');
});

test('"nn*"', () => {
  expect(normalizeLanguage('nn*')).toBe('nb-NO');
});

test('"no*"', () => {
  expect(normalizeLanguage('no*')).toBe('nb-NO');
});

test('"nl*"', () => {
  expect(normalizeLanguage('nl*')).toBe('nl-NL');
});

test('"pl*"', () => {
  expect(normalizeLanguage('pl*')).toBe('pl-PL');
});

// } else if (language === "pt-br") {
//   return "pt-BR";
test('"pt*"', () => {
  expect(normalizeLanguage('pt*')).toBe('pt-PT');
});

test('"ro*"', () => {
  expect(normalizeLanguage('ro*')).toBe('ro-RO');
});

test('"ru*"', () => {
  expect(normalizeLanguage('ru*')).toBe('ru-RU');
});

test('"sk*"', () => {
  expect(normalizeLanguage('sk*')).toBe('sk-SK');
});

test('"sl*"', () => {
  expect(normalizeLanguage('sl*')).toBe('sl-SI');
});

test('"sr-Cyrl', () => {
  expect(normalizeLanguage('sr-Cyrl')).toBe('sr-Cyrl');
});

test('"sr-Latn', () => {
  expect(normalizeLanguage('sr-Latn')).toBe('sr-Latn');
});

test('"sv*"', () => {
  expect(normalizeLanguage('sv*')).toBe('sv-SE');
});

test('"th*"', () => {
  expect(normalizeLanguage('th*')).toBe('th-TH');
});

test('"tr*"', () => {
  expect(normalizeLanguage('tr*')).toBe('tr-TR');
});

test('"uk*"', () => {
  expect(normalizeLanguage('uk*')).toBe('uk-UA');
});

test('"vi*"', () => {
  expect(normalizeLanguage('vi*')).toBe('vi-VN');
});

test('"yue"', () => {
  expect(normalizeLanguage('yue')).toBe('yue');
});

test('"zh-YUE"', () => {
  expect(normalizeLanguage('zh-YUE')).toBe('yue');
});

test('"zh-Hant"', () => {
  expect(normalizeLanguage('zh-Hant')).toBe('zh-Hant');
});

test('"zh-TW"', () => {
  expect(normalizeLanguage('zh-TW')).toBe('zh-Hant');
});

test('"zh-Hant-HK"', () => {
  expect(normalizeLanguage('zh-Hant-HK')).toBe('zh-Hant-HK');
});

test('"zh-HK"', () => {
  expect(normalizeLanguage('zh-HK')).toBe('zh-Hant-HK');
});

test('"zh-Hant-MO"', () => {
  expect(normalizeLanguage('zh-Hant-MO')).toBe('zh-Hant-MO');
});

test('"zh-MO"', () => {
  expect(normalizeLanguage('zh-MO')).toBe('zh-Hant-MO');
});

test('"zh-Hans-SG"', () => {
  expect(normalizeLanguage('zh-Hans-SG')).toBe('zh-Hans-SG');
});

test('"zh-SG"', () => {
  expect(normalizeLanguage('zh-SG')).toBe('zh-Hans-SG');
});

test('"zh*"', () => {
  expect(normalizeLanguage('zh*')).toBe('zh-Hans');
});

test('"*"', () => {
  expect(normalizeLanguage('*')).toBe('en-US');
});

test('"en-US"', () => {
  expect(normalizeLanguage('en-US')).toBe('en-US');
});
