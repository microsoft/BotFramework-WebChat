// TODO: (#3515) make into proper emotion objects
const PlaygroundStyles = `html,
body {
  height: 100%;
}

body {
  background-color: #EEE;
  margin: 0;
}

#root {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: row;
}

#app-container {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: row;
}

.button-bar {
  backdrop-filter: blur(2px);
  background-color: rgba(255, 255, 255, .8);
  border-left: 1px #DDD solid;
  display: flex;
  flex-direction: column;
  min-width: 278px;
  padding: 10px;
}

fieldset {
  display: flex;
  flex-direction: column;
}

fieldset > button {

  background-color: rgba(128, 128, 128, .2);
  border: 0;
  height: 25px;
  margin-bottom: 10px;
  outline: 0;
  padding: '5px 10px';
  width: 100%;
}

fieldset > button:hover {
  background-color: rgba(0, 0, 0, .2);
  color: 'White'
}

.webchat {
  height: 100%;
  margin: 0;
  max-width: 500px
}`;
export default PlaygroundStyles;
