# @msinternal/botframework-webchat-component-carousel

Private, headless carousel for Web Chat: behavior only, no markup and no styles. It is bundled into `botframework-webchat-component` and never published.

## Usage

```tsx
function Carousel() {
   const [{ atEnd, atStart, overflowing, scrolling }] = useCarouselState();
   const itemContainerRef = useCarouselItemContainerRef();
   const scrollableRef = useCarouselScrollableRef();
   const scrollBy = useCarouselScrollBy();

   // Render the scrollable element, the item container (its element children are the items),
   // and flippers calling scrollBy('previous') or scrollBy('next').
}

<CarouselComposer ponyfill={{ clearTimeout, setTimeout }}>
   <Carousel />
</CarouselComposer>;
```

## API

| Export                          | Description                                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `<CarouselComposer ponyfill>`   | Tracks the scrollable element and its items; `ponyfill` provides `clearTimeout` and `setTimeout`    |
| `useCarouselScrollableRef()`    | Ref callback for the element that scrolls horizontally                                              |
| `useCarouselItemContainerRef()` | Ref callback for the element whose element children are the items, in reading order                 |
| `useCarouselState()`            | `readonly [{ atEnd, atStart, overflowing, scrolling }]`, frozen                                     |
| `useCarouselScrollBy()`         | `(direction: 'next' \| 'previous') => void`: centers the next/previous item that can move into view |
| `useCarouselScrollToIndex()`    | `(index: number) => void`: centers the item, index clamped                                          |

## Behavior

- Direction-agnostic: reading order comes from the computed `direction` of the scrollable element, with the standard RTL model (negative `scrollLeft`).
- `atStart`, `atEnd` and `overflowing` have a 1-pixel tolerance, so fractional zoom does not leave them stale.
- Updates on scroll, on resize of the scrollable or of any item (`ResizeObserver`: viewport resize, late image loads; items can overflow the item container without resizing it), and when items are added or removed (`MutationObserver`).
- `scrolling` is `true` until 500 ms after the last scroll event.
- Scrolls with `behavior: 'smooth'`, or `'auto'` under `prefers-reduced-motion: reduce`. Repeated steps continue from where the running smooth scroll will end.
- Only the scrollable element scrolls (`scrollTo()`, not `scrollIntoView()`), so the transcript does not move.
- Re-centering after a manual scroll is left to CSS, e.g. `scroll-snap-type: x proximity` on the scrollable and `scroll-snap-align: center` on the items.
