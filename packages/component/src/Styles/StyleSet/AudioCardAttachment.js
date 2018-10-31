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
