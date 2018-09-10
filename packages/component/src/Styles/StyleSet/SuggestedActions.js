export default function createSuggestedActionsStyle({
  paddingRegular
}) {
  return {
    '&:not(:first-child)': {
      paddingLeft: paddingRegular / 2,
      paddingRight: paddingRegular / 2
    }
  };
}
