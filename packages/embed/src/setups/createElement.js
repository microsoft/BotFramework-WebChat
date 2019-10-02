export default function createElement(tagName, attributes, ...children) {
  const element = document.createElement(tagName);

  Object.keys(attributes).forEach(name => {
    const value = attributes[name];

    if (/^on[A-Z]/.test(name)) {
      element.addEventListener(name.substr(2).toLowerCase(), value.bind(element));
    } else if (name === 'style') {
      const styles = value;
      const elementStyle = element.style;

      Object.keys(styles).forEach(name => {
        elementStyle[name] = styles[name];
      });
    } else if (typeof value === 'boolean') {
      value && element.setAttribute(name, '');
    } else if (typeof value !== 'undefined') {
      element.setAttribute(name, value);
    }
  });

  const childrenFragment = document.createDocumentFragment();

  children.forEach(child =>
    childrenFragment.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
  );
  element.appendChild(childrenFragment);

  return element;
}
