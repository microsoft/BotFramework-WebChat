/* eslint-disable no-undef */

const { React } = window;

export default class MyRegistration {
  render() {
    return React.createElement('span', {}, ['🌎', React.createElement('slot')]);
  }
}
