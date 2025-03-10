import became from './became';

export default function errorMessageLogged(patternOrSubstring) {
  return became(
    patternOrSubstring instanceof RegExp
      ? `error message in console that match ${patternOrSubstring}`
      : `error message in console that contains "${patternOrSubstring}"`,
    async () => {
      const predicate =
        patternOrSubstring instanceof RegExp
          ? message => patternOrSubstring.test(message)
          : message => message.includes(patternOrSubstring);

      return (await host.getLogs()).some(({ level, message }) => level.name_ === 'SEVERE' && predicate(message));
    },
    1000
  );
}
