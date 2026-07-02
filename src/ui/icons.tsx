/**
 * The Çini motif set. One motif — the 8-point star (two squares, one
 * rotated 45°) — plus three quiet outline tab icons. Everything inherits
 * currentColor so components recolor via CSS tokens.
 */

/** Filled 8-point star — verdict stamps, mastery markers, dividers. */
export function Star({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="19.5" y="19.5" width="25" height="25" />
      <rect
        x="19.5"
        y="19.5"
        width="25"
        height="25"
        transform="rotate(45 32 32)"
      />
    </svg>
  );
}

/** Outline 8-point star — empty states. */
export function StarOutline({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
    >
      <rect x="19.5" y="19.5" width="25" height="25" />
      <rect
        x="19.5"
        y="19.5"
        width="25"
        height="25"
        transform="rotate(45 32 32)"
      />
    </svg>
  );
}

const tabIconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** Feed: stacked cards, the vertical scroll. */
export function FeedIcon() {
  return (
    <svg {...tabIconProps}>
      <rect x="4" y="2.5" width="16" height="5" rx="1.5" />
      <rect x="4" y="9.5" width="16" height="5" rx="1.5" />
      <rect x="4" y="16.5" width="16" height="5" rx="1.5" />
    </svg>
  );
}

/** Deck: two overlapping flashcards. */
export function DeckIcon() {
  return (
    <svg {...tabIconProps}>
      <rect x="3.5" y="4.5" width="14" height="17" rx="2" />
      <path d="M8 4.5 V4 a2 2 0 0 1 2 -2 h8.5 a2 2 0 0 1 2 2 v11 a2 2 0 0 1 -2 2 h-1" />
    </svg>
  );
}

/** Stats: three ascending bars. */
export function StatsIcon() {
  return (
    <svg {...tabIconProps} strokeWidth={2.4}>
      <path d="M5 20.5 v-6" />
      <path d="M12 20.5 V9.5" />
      <path d="M19 20.5 v-17" />
    </svg>
  );
}
