export default function isHTMLButtonElement(button: HTMLElement): button is HTMLButtonElement {
  return button.matches('button');
}
