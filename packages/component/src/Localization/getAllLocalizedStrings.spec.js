import getAllLocalizedStrings from './getAllLocalizedStrings';

const strings = getAllLocalizedStrings();

describe('Verify all strings are loaded properly', () => {
  test('ar-EG', () => {
    expect(strings['ar-EG'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('متصل');
  });

  test('ar-JO', () => {
    expect(strings['ar-JO'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('تم الإتصال');
  });

  test('ar-SA', () => {
    expect(strings['ar-SA'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('متصل');
  });

  test('bg-BG', () => {
    expect(strings['bg-BG'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Установена връзка');
  });

  test('ca-ES', () => {
    expect(strings['ca-ES'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Connectat');
  });

  test('cs-CZ', () => {
    expect(strings['cs-CZ'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Připojeno');
  });

  test('da-DK', () => {
    expect(strings['da-DK'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Forbundet');
  });

  test('de-DE', () => {
    expect(strings['de-DE'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Verbunden');
  });

  test('el-GR', () => {
    expect(strings['el-GR'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Συνδέθηκε');
  });

  test('en-US', () => {
    expect(strings['en-US'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Connected');
  });

  test('es-ES', () => {
    expect(strings['es-ES'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Conectado');
  });

  test('et-EE', () => {
    expect(strings['et-EE'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Ühendatud');
  });

  test('eu-ES', () => {
    expect(strings['eu-ES'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Konektatu da');
  });

  test('fi-FI', () => {
    expect(strings['fi-FI'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Yhdistetty');
  });

  test('fr-FR', () => {
    expect(strings['fr-FR'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Connecté');
  });

  test('gl-ES', () => {
    expect(strings['gl-ES'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Conectado');
  });

  test('he-IL', () => {
    expect(strings['he-IL'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('מחובר');
  });

  test('hi-IN', () => {
    expect(strings['hi-IN'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('कनेक्ट किया गया');
  });

  test('hr-HR', () => {
    expect(strings['hr-HR'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Povezano');
  });

  test('hu-HU', () => {
    expect(strings['hu-HU'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Csatlakoztatva');
  });

  test('id-ID', () => {
    expect(strings['id-ID'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Tersambung');
  });

  test('it-IT', () => {
    expect(strings['it-IT'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Connesso');
  });

  test('ja-JP', () => {
    expect(strings['ja-JP'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('接続済み');
  });

  test('kk-KZ', () => {
    expect(strings['kk-KZ'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Қосылған');
  });

  test('ko-KR', () => {
    expect(strings['ko-KR'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('연결됨');
  });

  test('lt-LT', () => {
    expect(strings['lt-LT'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Prijungta');
  });

  test('lv-LV', () => {
    expect(strings['lv-LV'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Izveidots savienojums');
  });

  test('ms-MY', () => {
    expect(strings['ms-MY'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Disambungkan');
  });

  test('nb-NO', () => {
    expect(strings['nb-NO'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Tilkoblet');
  });

  test('nl-NL', () => {
    expect(strings['nl-NL'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Verbonden');
  });

  test('pl-PL', () => {
    expect(strings['pl-PL'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Połączono');
  });

  test('pt-BR', () => {
    expect(strings['pt-BR'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Conectado');
  });

  test('pt-PT', () => {
    expect(strings['pt-PT'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Ligado');
  });

  test('ro-RO', () => {
    expect(strings['ro-RO'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Conectat');
  });

  test('ru-RU', () => {
    expect(strings['ru-RU'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Подключено');
  });

  test('sk-SK', () => {
    expect(strings['sk-SK'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Pripojené');
  });

  test('sl-SI', () => {
    expect(strings['sl-SI'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Povezava je vzpostavljena.');
  });

  test('sr-Cyrl', () => {
    expect(strings['sr-Cyrl'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Повезано');
  });

  test('sr-Latn', () => {
    expect(strings['sr-Latn'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Povezano');
  });

  test('sv-SE', () => {
    expect(strings['sv-SE'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Ansluten');
  });

  test('th-TH', () => {
    expect(strings['th-TH'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('เชื่อมต่อแล้ว');
  });

  test('tr-TR', () => {
    expect(strings['tr-TR'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Bağlı');
  });

  test('uk-UA', () => {
    expect(strings['uk-UA'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Підключено');
  });

  test('vi-VN', () => {
    expect(strings['vi-VN'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('Đã kết nối');
  });

  test('yue', () => {
    expect(strings['yue'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('接駁到');
  });

  test('zh-Hans', () => {
    expect(strings['zh-Hans'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已连接');
  });

  test('zh-Hant', () => {
    expect(strings['zh-Hant'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已連線');
  });

  test('zh-Hans-SG', () => {
    expect(strings['zh-Hans-SG'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已连接');
  });

  test('zh-Hant-HK', () => {
    expect(strings['zh-Hant-HK'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已連線');
  });

  test('zh-Hant-MO', () => {
    expect(strings['zh-Hant-MO'].CONNECTIVITY_STATUS_ALT_CONNECTED).toBe('已連線');
  });
});
