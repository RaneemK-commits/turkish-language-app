/**
 * Phase 0 shell: proves the snap-scroll feed skeleton (PDR §8.2) with
 * placeholder cards. Real <FeedView>/<FeedEngine> land in Phase 1.
 */
const placeholderCards = [
  {
    kicker: "Akış",
    formula: "akış  →  flow / stream / feed",
    body: "Scroll down. Each card is one bite-sized unit — a grammar formula or a drill. This shell proves the feed mechanics; content arrives in Phase 1.",
  },
  {
    kicker: "Preview · Vowel Harmony",
    formula: "suffix vowel copies the last stem vowel\nA = {a, e}   ·   I = {ı, i, u, ü}",
    body: "ev → evler (e is front → -ler) · kapı → kapılar (ı is back → -lar). One rule, drilled until automatic — that's the whole method.",
  },
  {
    kicker: "Phase 0",
    formula: "shell ✓  ·  schema ✓  ·  CI ✓",
    body: "Snap-scroll works if each swipe landed exactly one card. Next: lesson cards, exercises, and the FSRS-ordered feed.",
  },
];

export function App() {
  return (
    <main className="card-scroller" aria-label="Akış feed">
      {placeholderCards.map((card) => (
        <section key={card.kicker} className="feed-card">
          <div className="feed-card__inner">
            <p className="feed-card__kicker">{card.kicker}</p>
            <p className="feed-card__formula" style={{ whiteSpace: "pre-line" }}>
              {card.formula}
            </p>
            <p className="feed-card__body">{card.body}</p>
          </div>
        </section>
      ))}
      <div className="scroll-hint">swipe ↑</div>
    </main>
  );
}
