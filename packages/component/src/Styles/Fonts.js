function fontFamily(fonts) {
  return fonts.map(font => `'${ font }'`).join(', ');
}

const monospaceFont = {
  fontFamily: fontFamily(['Consolas', 'Courier New', 'monospace'])
};

const monospaceSmallFont = {
  ...monospaceFont,
  fontSize: '80%'
};

const primaryFont = {
  fontFamily: fontFamily(['Calibri', 'Helvetica Neue', 'Arial', 'sans-serif'])
};

const primarySmallFont = {
  ...primaryFont,
  fontSize: '80%'
};

export {
  monospaceFont,
  monospaceSmallFont,

  primaryFont,
  primarySmallFont
}
