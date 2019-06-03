const SET_LANGUAGE = 'WEB_CHAT/SET_LANGUAGE';

export default function setLanguage(language) {
  return {
    type: SET_LANGUAGE,
    payload: { language }
  };
}

export { SET_LANGUAGE };
