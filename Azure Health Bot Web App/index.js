// In this Script, Just on line #
// Just replace <WEBCHAT_SECRET> with your own webchat secret


(async function () {
    // Note, for the simplicity of this example, we are fetching the DirectLine token here;
    // however, it is recommended that you create a backend REST API to generate and manage
    // your tokens.
    const res = await fetch(
      "https://directline.botframework.com/v3/directline/tokens/generate",
      {
        method: "POST",
        headers: {
          Authorization: `bearer <Web Chat Secret>`,
          "Content-Type": "application/json",
        },
        body: {
          // The user id must start with `dl` and should be unique for each user.
          User: { Id: "dl_user_id" },
        },
      }
    );
    const { token } = await res.json();
     const styleOptions = {
         botAvatarInitials: 'Nio',
         userAvatarInitials: 'You'
       };

    window.WebChat.renderWebChat(
      {
        directLine: window.WebChat.createDirectLine({ token }),
        styleOptions,
        webSpeechPonyfillFactory: window.WebChat.createBrowserWebSpeechPonyfillFactory({ token }),
        
      },
      document.getElementById("webchat")
    );
  })().catch((err) => console.log(err));



  

   

