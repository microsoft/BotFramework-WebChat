export default function () {
  return {
    display: 'flex',
    flexDirection: 'column',

    '& > ul.media-list': {
      listStyleType: 'none',
      margin: 10,
      padding: 0
    }
  };
}
