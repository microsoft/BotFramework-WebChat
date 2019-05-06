// TODO: [P4] We are moving attachments related to Adaptive Cards out of "component"
//       Later, we will rewrite these attachments without Adaptive Cards
//       We are leaving the CSS here as-is for now

export default function () {
  return {
    display: 'flex',
    flexDirection: 'column',

    '& > ul.media-list': {
      listStyleType: 'none',
      margin: 0,
      padding: 0
    }
  };
}
