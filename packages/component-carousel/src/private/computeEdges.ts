// Scroll positions are in CSS pixels; fractional zoom can leave the position a fraction of a pixel away from an edge.
const TOLERANCE = 1;

type ComputeEdgesInit = {
  /** Largest scroll position, i.e. `scrollWidth - clientWidth`. */
  readonly maxPosition: number;

  /** Distance scrolled from the inline-start edge, always zero or positive (in RTL, `scrollLeft` is zero or negative). */
  readonly position: number;
};

type Edges = {
  readonly atEnd: boolean;
  readonly atStart: boolean;
  readonly overflowing: boolean;
};

export default function computeEdges({ maxPosition, position }: ComputeEdgesInit): Edges {
  return Object.freeze({
    atEnd: position >= maxPosition - TOLERANCE,
    atStart: position <= TOLERANCE,
    overflowing: maxPosition > TOLERANCE
  });
}

export { type ComputeEdgesInit, type Edges };
