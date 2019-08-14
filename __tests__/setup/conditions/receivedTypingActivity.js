import { Condition } from 'selenium-webdriver';

export default function receivedTypingActivity() {
  return new Condition(
    `Waiting for typing activity`,
    async driver =>
      await driver.executeScript(
        () =>
          ~window.WebChatTest.actions
            .filter(({ type }) => type === 'DIRECT_LINE/INCOMING_ACTIVITY')
            .findIndex(
              ({
                payload: {
                  activity: {
                    type,
                    from: { role }
                  }
                }
              }) => type === 'typing' && role === 'bot'
            )
      )
  );
}
