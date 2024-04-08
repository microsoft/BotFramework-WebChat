import { type Components } from 'botframework-webchat-component';

// TODO: We should do isomorphic:
//       - If loading UMD, we should look at window.WebChat.Components.ThemeProvider
//       - Otherwise, we should import { type Components } from 'botframework-webchat-component'
type ThemeProviderType = (typeof Components)['ThemeProvider'];

const {
  WebChat: {
    Components: { ThemeProvider }
  }
} = globalThis as unknown as {
  WebChat: { Components: { ThemeProvider: ThemeProviderType } };
};

export default ThemeProvider;
