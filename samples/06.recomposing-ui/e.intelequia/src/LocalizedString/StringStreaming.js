import React from 'react';
import { setCookie, getCookie, checkCookie } from '../CookiesUtils';

const localizedCancelStream = {
  en: {
    cancelStream: 'Stop generation'
  },
  es: {
    cancelStream: 'Detener generación'
  },
  de: {
    cancelStream: 'Erzeugung stoppen'
  },
  fr: {
    cancelStream: 'Arrêt de la production'
  },
  it: {
    cancelStream: 'Interrompere la generazione'
  },
  el: {
    cancelStream: 'Διακοπή παραγωγής'
  }
};

const getCancelStream = locale => {
  var date = new Date();
  date.setDate(date.getDate() + 14);
  const language = localizedCancelStream[locale.substring(0, 2)];

  return language.cancelStream;
};

export default getCancelStream;
