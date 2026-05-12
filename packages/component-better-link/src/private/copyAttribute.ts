function copyAttribute(fromElement: HTMLElement, toElement: HTMLElement, attributeName: string) {
  const value = fromElement.getAttribute(attributeName);

  value === null || toElement.setAttribute(attributeName, value);
}

export default copyAttribute;
