module.exports = {
  twemoji: {
    parse: function(text) {
      return typeof twemoji !== 'undefined' ? twemoji.parse(text, {base: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.1/'}) : text
    }
  }
}