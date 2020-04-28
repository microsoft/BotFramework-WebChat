/* eslint no-magic-numbers: "off" */

export default function createTextContentStyle({ bubbleMaxWidth, bubbleMinHeight, primaryFont, paddingRegular }) {
  return {
    fontFamily: primaryFont,
    margin: 0,
    minHeight: bubbleMinHeight - paddingRegular * 2,
    padding: paddingRegular,

    '& > :first-child': {
      marginTop: 0
    },

    '& > :last-child': {
      marginBottom: 0
    },

    '&.markdown': {
      '& img': {
        maxWidth: bubbleMaxWidth,
        width: '100%'
      },

      '& pre': {
        overflow: 'hidden'
      }
    },
    '& .externalLink': {
      margin: 0,
      padding: 0,
      backgroundPosition: 'center right',
      backgroundRepeat: 'no-repeat',
      backgroundImage:
        'linear-gradient(transparent,transparent),url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDBWMjZIMjZWMzJIMFY2SDZWMEgzMlpNMzAgMjRWMkg4VjZIMTJWOEgyVjMwSDI0VjIwSDI2VjI0SDMwWk0xNC43MDMxIDE4LjcwMzFMMTMuMjk2OSAxNy4yOTY5TDIyLjU3ODEgOEgxNlY2SDI2VjE2SDI0VjkuNDIxODhMMTQuNzAzMSAxOC43MDMxWiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg==)',
      paddingRight: '13px'
    }
  };
}
