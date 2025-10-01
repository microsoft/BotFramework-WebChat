/* eslint-env browser */

// #region TODO: Remove me after we bump Chrome to v117+
const customElementNames = customElements.getName instanceof Function ? null : new WeakMap();

export function getCustomElementName(customElementConstructor) {
  if (customElementNames) {
    return customElementNames.get(customElementConstructor);
  }
  return customElements.getName(customElementConstructor);
}

function setCustomElementName(customElementConstructor, name) {
  if (customElementNames) {
    customElementNames.set(customElementConstructor, name);
  }
  // No need to set for browsers that support customElements.getName()
}
// #endregion

export function customElement(elementKey, createElementClass) {
  const elementRegistration = document.querySelector(`element-registration[element-key="${elementKey}"]`);
  elementRegistration.elementConstructor = createElementClass(elementRegistration);
}

function addSourceMapToExtractedScript(scriptContent, originalFileUrl) {
  const sourceMap = {
    version: 3,
    sources: [originalFileUrl],
    names: [],
    mappings: 'AAAA', // Simple mapping - entire script maps to original file
    file: originalFileUrl.split('/').pop(),
    sourceRoot: '',
    sourcesContent: [scriptContent]
  };

  const base64Map = btoa(JSON.stringify(sourceMap));
  const dataUrl = `data:application/json;charset=utf-8;base64,${base64Map}`;

  // TODO: Figure out how to make setting breakpoints work
  return scriptContent + `\n//# sourceMappingURL=${dataUrl}`;
}

function fixScript(script, url) {
  const newScript = document.createElement('script');

  Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
  newScript.text = addSourceMapToExtractedScript(script.text, url);

  return newScript;
}

function initDocument(elementRegistration, currentDocument) {
  const moduleUrl = new URL(`./${elementRegistration.getAttribute('element-key')}.ce.js`, import.meta.url).toString();
  const allowedElementNames = ['link', 'style', 'script'];

  if (!currentDocument) {
    throw new Error('Custom element must be registered within a <element-registration> element.');
  }

  const result = Promise.withResolvers();

  Object.defineProperty(elementRegistration, 'elementConstructor', {
    set(constructor) {
      if (!constructor) {
        throw new Error('Custom element constructor is required.');
      }

      const elementName = elementRegistration.getAttribute('element-name');

      if (!elementName) {
        throw new Error('Custom element must have a name.');
      }

      customElements.define(elementName, constructor, constructor.options);
      setCustomElementName(constructor, elementName);

      result.resolve(constructor);
    },
    get() {
      return customElement.get(elementRegistration.getAttribute('element-name'));
    }
  });

  document.head.append(
    ...Array.from(currentDocument.head.children)
      .filter(element => allowedElementNames.includes(element.localName))
      .map(element => (element.localName === 'script' ? fixScript(element, moduleUrl) : element))
  );

  elementRegistration.append(
    ...Array.from(currentDocument.body.children).map(element =>
      element.localName === 'script' ? fixScript(element, moduleUrl) : element
    )
  );
  document.body.appendChild(elementRegistration);

  return result.promise;
}

export function registerElements(...elementNames) {
  const parser = new DOMParser();
  const entries = elementNames.map(entry => (typeof entry === 'string' ? [entry, entry] : Object.entries(entry).at(0)));

  const raceInit = (key, initPromise) =>
    Promise.race([
      new Promise((_resolve, reject) => {
        setTimeout(
          () => reject(new Error(`Could not initialize custom element "${key}". Did you call customElement()?`)),
          5000
        );
      }),
      initPromise
    ]);

  return Promise.all(
    entries.map(async ([key, elementName]) => {
      const content = await fetch(new URL(`./${key}.ce`, import.meta.url)).then(response => response.text());

      const elementRegistration = document.createElement('element-registration');
      elementRegistration.setAttribute('element-key', key);
      elementRegistration.setAttribute('element-name', elementName);

      return raceInit(key, initDocument(elementRegistration, parser.parseFromString(content, 'text/html')));
    })
  );
}
