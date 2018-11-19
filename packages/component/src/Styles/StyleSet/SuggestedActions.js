export default function createSuggestedActionsStyle({
  paddingRegular
}) {
  return {
    paddingLeft: paddingRegular / 2,
    paddingRight: paddingRegular / 2,

      '& > div > button > div.slider > div': {
        fontSize: 30
      }
  };
}
