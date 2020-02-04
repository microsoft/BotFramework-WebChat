export default function walkMarkdownTokens(tokens, walker) {
  return tokens.map(token => {
    if (token) {
      const nextToken = walker(token);

      if (nextToken.children) {
        nextToken.children = walkMarkdownTokens(nextToken.children, walker);
      }

      return nextToken;
    }

    return token;
  });
}
