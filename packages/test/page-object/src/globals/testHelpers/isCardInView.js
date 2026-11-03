/**
 * Checks whether a card of a carousel is wholly in view, i.e. not clipped by the filmstrip of the carousel.
 *
 * @param {Element} card - The card (attachment) element inside the filmstrip of the carousel.
 * @returns {boolean} `true` if the card is wholly in view, otherwise `false`.
 */
export default function isCardInView(card) {
  const cardRect = card.getBoundingClientRect();
  const filmstripRect = card.closest('.carousel-filmstrip').getBoundingClientRect();

  return cardRect.left >= filmstripRect.left && cardRect.right <= filmstripRect.right;
}
