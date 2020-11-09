import React from 'react'
import { setCookie, getCookie, checkCookie } from './CookiesUtils'

const localizedUsernames = {
    'en': {
        anonymousUsername: 'Anonymous'
    },
    'ja': {
        anonymousUsername: '匿名'
    },
    'nb': {
        anonymousUsername: 'Anonym'
    },
    'da': {
        anonymousUsername: 'Anonym'
    },
    'de': {
        anonymousUsername: 'Anonym'
    },
    'pl': {
        anonymousUsername: 'anonimowy'
    },
    'ru': {
        anonymousUsername: 'анонимное'
    },
    'nl': {
        anonymousUsername: 'Anoniem'
    },
    'lv': {
        anonymousUsername: 'Anonīms'
    },
    'pt': {
        anonymousUsername: 'Anônimo'
    },
    'fr': {
        anonymousUsername: 'Anonyme'
    },
    'es': {
        anonymousUsername: 'Anónimo'
    },
    'el': {
        anonymousUsername: 'Ανώνυμος'
    },
    'it': {
        anonymousUsername: 'Anonimo'
    },
    'zh': {
        anonymousUsername: 'Anonymous'
    },
    'cs': {
        anonymousUsername: 'Anonymous'
    },
    'ko': {
        anonymousUsername: '익명'
    },
    'hu' : {
        anonymousUsername: 'Névtelen'
    },
    'sv' : {
        anonymousUsername: 'Anonym'
    },
    'tr' : {
        anonymousUsername: 'Anonim'
   },
   'fi' : {
        anonymousUsername: 'anonyymi'
    }
};

const getUser = (locale) => {

    var date = new Date();
    date.setDate(date.getDate() + 14);
    
    const language = localizedUsernames[locale.substring(0,2)];
    const userId = `${language.anonymousUsername} ${(Math.random() * 1000000).toString().substring(0, 5)}`;

    const bui = checkCookie('bui', userId, { path: '/', expires: date});
    const bun = checkCookie('bun', userId, { path: '/', expires: date});
    return bui;
}

export default getUser