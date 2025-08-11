import activities from './activities';

export default function getActivityAttachments() {
  return Object.freeze(
    activities().map(element =>
      Object.freeze(Array.from(element.querySelectorAll('[aria-roledescription="attachment"]')))
    )
  );
}
