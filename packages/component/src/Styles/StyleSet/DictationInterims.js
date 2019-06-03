export default function createDictationInterimsStyle({ paddingRegular, primaryFont }) {
  return {
    fontFamily: primaryFont,
    margin: 0,
    paddingBottom: 0,
    paddingLeft: paddingRegular,
    paddingRight: paddingRegular,
    paddingTop: 0,

    '&.dictating > span:not(:first-child), &.status': {
      opacity: 0.5
    }
  };
}
