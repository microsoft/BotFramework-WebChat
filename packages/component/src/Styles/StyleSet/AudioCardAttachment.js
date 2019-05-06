// TODO: [P4] We are moving attachments related to Adaptive Cards out of "component"
//       Later, we will rewrite these attachments without Adaptive Cards
//       We are leaving the CSS here as-is for now

export default function ({
  paddingRegular
}) {
  return {
    display: 'flex',
    flexDirection: 'column',

    '& > ul.media-list': {
      listStyleType: 'none',
      margin: paddingRegular,
      padding: 0
    }
  };
}
