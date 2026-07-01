/**
 * The vertical snap feed (PDR §8.2).
 * - Pure CSS scroll-snap; JS only *reads* scroll position.
 * - Advance lock: cards beyond the first unanswered exercise are not rendered,
 *   so the container physically cannot scroll past them.
 * - Windowed rendering: cards far from the viewport render as empty snap
 *   placeholders (cheap divs), keeping the DOM light as content grows.
 */
import { useRef, type ReactNode } from "react";
import { useFeedStore, selectUnlockedMax } from "@/store/feedStore";
import type { FeedItem } from "@/domain/feed/linearFeed";

const WINDOW = 2; // cards rendered on each side of the current one

export function CardScroller({
  renderItem,
}: {
  renderItem: (item: FeedItem, advance: () => void, active: boolean) => ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const items = useFeedStore((s) => s.items);
  const index = useFeedStore((s) => s.index);
  const setIndex = useFeedStore((s) => s.setIndex);
  const unlockedMax = useFeedStore(selectUnlockedMax);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== index) setIndex(i);
  };

  // Advance from a known card position — the card that was just answered.
  // (Deriving from scrollTop desyncs if a smooth scroll gets interrupted.)
  const advanceFrom = (i: number) => () => {
    const el = ref.current;
    if (!el) return;
    const next = Math.min(i + 1, items.length - 1);
    setIndex(next);
    // The lock has just released; the next card exists by the next frame.
    requestAnimationFrame(() => {
      el.scrollTo({ top: next * el.clientHeight, behavior: "smooth" });
    });
  };

  const visible = items.slice(0, unlockedMax + 1);

  return (
    <main
      ref={ref}
      className="card-scroller"
      onScroll={onScroll}
      aria-label="Akış feed"
    >
      {visible.map((item, i) => {
        const inWindow = Math.abs(i - index) <= WINDOW;
        return (
          <section key={feedKey(item, i)} className="feed-card">
            {inWindow ? renderItem(item, advanceFrom(i), i === index) : null}
          </section>
        );
      })}
    </main>
  );
}

function feedKey(item: FeedItem, i: number): string {
  if (item.kind === "lesson" || item.kind === "exercise") return item.card.id;
  return `summary-${i}`;
}
