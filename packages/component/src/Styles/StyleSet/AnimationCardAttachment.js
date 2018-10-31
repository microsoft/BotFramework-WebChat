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
