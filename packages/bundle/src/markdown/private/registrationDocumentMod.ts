export default function registrationDocumentMod<T extends Document | DocumentFragment>(
  documentFragment: T,
  registrationTagName: string,
  fromTagName: string
): T {
  for (const element of [...documentFragment.querySelectorAll(fromTagName)]) {
    const registration = document.createElement(registrationTagName);

    registration.setAttribute('from', element.getAttribute('from'));
    registration.append(...element.childNodes);
    element.replaceWith(registration);
  }

  return documentFragment;
}
