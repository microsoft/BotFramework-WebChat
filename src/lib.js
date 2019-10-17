module.exports = {
  twemoji: {
    parse: function(text) {
      return typeof twemoji !== 'undefined' ? twemoji.parse(text) : text
    }
  }
}