const primaryFont = {
  fontFamily: ['Calibri', 'Helvetica Neue', 'Arial', 'sans-serif'].map(font => `'${ font }'`).join(', ')
};

const primarySmallFont = {
  ...primaryFont,
  fontSize: '80%'
};

export {
  primaryFont,
  primarySmallFont
}
