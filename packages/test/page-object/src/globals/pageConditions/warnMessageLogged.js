import became from './became';

const LOG_PATTERN = /^([^\s]*)\s([^\s]*)\s(.*)$/u;

export default function warnMessageLogged(patternOrSubstring) {
  return became(
    patternOrSubstring instanceof RegExp
      ? `warn message in console that match ${patternOrSubstring}`
      : `warn message in console that contains "${patternOrSubstring}"`,
    async () => {
      const predicate =
        patternOrSubstring instanceof RegExp
          ? message => patternOrSubstring.test(message)
          : message => message.includes(patternOrSubstring);

      return (await host.getLogs()).some(({ level, message }) => {
        let parsedMessage = '';

        try {
          parsedMessage = JSON.parse(LOG_PATTERN.exec(message)[3]);
        } catch {
          // Intentionally left blank.
        }

        return level.name_ === 'WARNING' && predicate(parsedMessage);
      });
    },
    1000
  );
}
