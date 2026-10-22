type CarouselState = {
  /** Cannot scroll further towards the inline-end edge (1 pixel tolerance). */
  readonly atEnd: boolean;

  /** Cannot scroll further towards the inline-start edge (1 pixel tolerance). */
  readonly atStart: boolean;

  /** The content is wider than the scrollport (1 pixel tolerance). */
  readonly overflowing: boolean;

  /** A scroll event happened in the last 500 milliseconds. */
  readonly scrolling: boolean;
};

export { type CarouselState };
