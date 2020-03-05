import getAllLocalizedStrings from '../Localization/getAllLocalizedStrings';
import normalizeLanguage from './normalizeLanguage';

const strings = getAllLocalizedStrings();

test('"ar-EG"', () => {
  expect(normalizeLanguage('ar-EG')).toBe('ar-EG');
  expect(strings[normalizeLanguage('ar-EG')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('متصل');
});

test('"ar-jo"', () => {
  expect(normalizeLanguage('ar-JO')).toBe('ar-JO');
  expect(strings[normalizeLanguage('ar-JO')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('تم الإتصال');
});

test('"ar*"', () => {
  expect(normalizeLanguage('ar*')).toBe('ar-SA');
  expect(strings[normalizeLanguage('ar*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('متصل');
});

test('"bg*"', () => {
  expect(normalizeLanguage('bg*')).toBe('bg-BG');
  expect(strings[normalizeLanguage('bg*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Установена връзка');
});

test('"ca*"', () => {
  expect(normalizeLanguage('ca*')).toBe('ca-ES');
  expect(strings[normalizeLanguage('ca*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Connectat');
});

test('"cs*"', () => {
  expect(normalizeLanguage('cs*')).toBe('cs-CZ');
  expect(strings[normalizeLanguage('cs*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Připojeno');
});

test('"da*"', () => {
  expect(normalizeLanguage('da*')).toBe('da-DK');
  expect(strings[normalizeLanguage('da*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Forbundet');
});

test('"de*"', () => {
  expect(normalizeLanguage('de*')).toBe('de-DE');
  expect(strings[normalizeLanguage('de*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Verbunden');
});

test('"el*"', () => {
  expect(normalizeLanguage('el*')).toBe('el-GR');
  expect(strings[normalizeLanguage('el*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Συνδέθηκε');
});

test('"es*"', () => {
  expect(normalizeLanguage('es*')).toBe('es-ES');
  expect(strings[normalizeLanguage('es*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Conectado');
});

test('"et*"', () => {
  expect(normalizeLanguage('et*')).toBe('et-EE');
  expect(strings[normalizeLanguage('et*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Ühendatud');
});

test('"eu*"', () => {
  expect(normalizeLanguage('eu*')).toBe('eu-ES');
  expect(strings[normalizeLanguage('eu*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Konektatu da');
});

test('"fi*"', () => {
  expect(normalizeLanguage('fi*')).toBe('fi-FI');
  expect(strings[normalizeLanguage('fi*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Yhdistetty');
});

test('"fr*"', () => {
  expect(normalizeLanguage('fr*')).toBe('fr-FR');
  expect(strings[normalizeLanguage('fr*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Connecté');
});

test('"gl*"', () => {
  expect(normalizeLanguage('gl*')).toBe('gl-ES');
  expect(strings[normalizeLanguage('gl*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Conectado');
});

test('"he*"', () => {
  expect(normalizeLanguage('he*')).toBe('he-IL');
  expect(strings[normalizeLanguage('he*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('מחובר');
});

test('"hi*"', () => {
  expect(normalizeLanguage('hi*')).toBe('hi-IN');
  expect(strings[normalizeLanguage('hi*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('कनेक्ट किया गया');
});

test('"hr*"', () => {
  expect(normalizeLanguage('hr*')).toBe('hr-HR');
  expect(strings[normalizeLanguage('hr*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Povezano');
});

test('"hu*"', () => {
  expect(normalizeLanguage('hu*')).toBe('hu-HU');
  expect(strings[normalizeLanguage('hu*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Csatlakoztatva');
});

test('"id*"', () => {
  expect(normalizeLanguage('id*')).toBe('id-ID');
  expect(strings[normalizeLanguage('id*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Tersambung');
});

test('"it*"', () => {
  expect(normalizeLanguage('it*')).toBe('it-IT');
  expect(strings[normalizeLanguage('it*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Connesso');
});

test('"ja*"', () => {
  expect(normalizeLanguage('ja*')).toBe('ja-JP');
  expect(strings[normalizeLanguage('ja*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('接続済み');
});

test('"kk*"', () => {
  expect(normalizeLanguage('kk*')).toBe('kk-KZ');
  expect(strings[normalizeLanguage('kk*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Қосылған');
});

test('"ko*"', () => {
  expect(normalizeLanguage('ko*')).toBe('ko-KR');
  expect(strings[normalizeLanguage('ko*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('연결됨');
});

test('"lt*"', () => {
  expect(normalizeLanguage('lt*')).toBe('lt-LT');
  expect(strings[normalizeLanguage('lt*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Prijungta');
});

test('"lv*"', () => {
  expect(normalizeLanguage('lv*')).toBe('lv-LV');
  expect(strings[normalizeLanguage('lv*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Izveidots savienojums');
});

test('"ms*"', () => {
  expect(normalizeLanguage('ms*')).toBe('ms-MY');
  expect(strings[normalizeLanguage('ms*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Disambungkan');
});

test('"nb*"', () => {
  expect(normalizeLanguage('nb*')).toBe('nb-NO');
  expect(strings[normalizeLanguage('nb*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Tilkoblet');
});

test('"nn*"', () => {
  expect(normalizeLanguage('nn*')).toBe('nb-NO');
  expect(strings[normalizeLanguage('nn*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Tilkoblet');
});

test('"no*"', () => {
  expect(normalizeLanguage('no*')).toBe('nb-NO');
  expect(strings[normalizeLanguage('no*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Tilkoblet');
});

test('"nl*"', () => {
  expect(normalizeLanguage('nl*')).toBe('nl-NL');
  expect(strings[normalizeLanguage('nl*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Verbonden');
});

test('"pl*"', () => {
  expect(normalizeLanguage('pl*')).toBe('pl-PL');
  expect(strings[normalizeLanguage('pl*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Połączono');
});

test('"pt-BR"', () => {
  expect(normalizeLanguage('pt-BR')).toBe('pt-BR');
  expect(strings[normalizeLanguage('pt-BR')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Conectado');
});

test('"pt*"', () => {
  expect(normalizeLanguage('pt*')).toBe('pt-PT');
  expect(strings[normalizeLanguage('pt*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Ligado');
});

test('"ro*"', () => {
  expect(normalizeLanguage('ro*')).toBe('ro-RO');
  expect(strings[normalizeLanguage('ro*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Conectat');
});

test('"ru*"', () => {
  expect(normalizeLanguage('ru*')).toBe('ru-RU');
  expect(strings[normalizeLanguage('ru*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Подключено');
});

test('"sk*"', () => {
  expect(normalizeLanguage('sk*')).toBe('sk-SK');
  expect(strings[normalizeLanguage('sk*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Pripojené');
});

test('"sl*"', () => {
  expect(normalizeLanguage('sl*')).toBe('sl-SI');
  expect(strings[normalizeLanguage('sl*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Povezava je vzpostavljena.');
});

test('"sr-Cyrl', () => {
  expect(normalizeLanguage('sr-Cyrl')).toBe('sr-Cyrl');
  expect(strings[normalizeLanguage('sr-Cyrl')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Повезано');
});

test('"sr-Latn', () => {
  expect(normalizeLanguage('sr-Latn')).toBe('sr-Latn');
  expect(strings[normalizeLanguage('sr-Latn')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Povezano');
});

test('"sv*"', () => {
  expect(normalizeLanguage('sv*')).toBe('sv-SE');
  expect(strings[normalizeLanguage('sv*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Ansluten');
});

test('"th*"', () => {
  expect(normalizeLanguage('th*')).toBe('th-TH');
  expect(strings[normalizeLanguage('th*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('เชื่อมต่อแล้ว');
});

test('"tr*"', () => {
  expect(normalizeLanguage('tr*')).toBe('tr-TR');
  expect(strings[normalizeLanguage('tr*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Bağlı');
});

test('"uk*"', () => {
  expect(normalizeLanguage('uk*')).toBe('uk-UA');
  expect(strings[normalizeLanguage('uk*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Підключено');
});

test('"vi*"', () => {
  expect(normalizeLanguage('vi*')).toBe('vi-VN');
  expect(strings[normalizeLanguage('vi*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Đã kết nối');
});

test('"yue"', () => {
  expect(normalizeLanguage('yue')).toBe('yue');
  expect(strings[normalizeLanguage('zh-YUE')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('接駁到');
});

test('"zh-YUE"', () => {
  expect(normalizeLanguage('zh-YUE')).toBe('yue');
  expect(strings[normalizeLanguage('zh-YUE')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('接駁到');
});

test('"zh-Hant"', () => {
  expect(normalizeLanguage('zh-Hant')).toBe('zh-Hant');
  expect(strings[normalizeLanguage('zh-Hant')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已連線');
});

test('"zh-TW"', () => {
  expect(normalizeLanguage('zh-TW')).toBe('zh-Hant');
  expect(strings[normalizeLanguage('zh-TW')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已連線');
});

test('"zh-Hant-HK"', () => {
  expect(normalizeLanguage('zh-Hant-HK')).toBe('zh-Hant-HK');
  expect(strings[normalizeLanguage('zh-Hant-HK')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已連線');
});

test('"zh-HK"', () => {
  expect(normalizeLanguage('zh-HK')).toBe('zh-Hant-HK');
  expect(strings[normalizeLanguage('zh-HK')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已連線');
});

test('"zh-Hant-MO"', () => {
  expect(normalizeLanguage('zh-Hant-MO')).toBe('zh-Hant-MO');
  expect(strings[normalizeLanguage('zh-Hant-MO')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已連線');
});

test('"zh-MO"', () => {
  expect(normalizeLanguage('zh-MO')).toBe('zh-Hant-MO');
  expect(strings[normalizeLanguage('zh-MO')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已連線');
});

test('"zh-Hans-SG"', () => {
  expect(normalizeLanguage('zh-Hans-SG')).toBe('zh-Hans-SG');
  expect(strings[normalizeLanguage('zh-Hans-SG')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已连接');
});

test('"zh-SG"', () => {
  expect(normalizeLanguage('zh-SG')).toBe('zh-Hans-SG');
  expect(strings[normalizeLanguage('zh-SG')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已连接');
});

test('"zh*"', () => {
  expect(normalizeLanguage('zh*')).toBe('zh-Hans');
  expect(strings[normalizeLanguage('zh*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已连接');
});

test('"*"', () => {
  expect(normalizeLanguage('*')).toBe('en-US');
  expect(strings[normalizeLanguage('*')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Connected');
});

test('"en-US"', () => {
  expect(normalizeLanguage('en-US')).toBe('en-US');
  expect(strings[normalizeLanguage('en-US')].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Connected');
});
