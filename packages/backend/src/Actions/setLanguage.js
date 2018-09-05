const SET_LANGUAGE = 'DIRECT_LINE/SET_LANGUAGE';

export default function setLanguage(language) {
  return {
    type: SET_LANGUAGE,
    payload: { language }
  };
}

export { SET_LANGUAGE }
