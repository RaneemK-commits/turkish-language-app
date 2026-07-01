import { useUiStore, type Tab } from "@/store/uiStore";
import { useSrsStore, selectDueConceptIds } from "@/store/srsStore";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "feed", label: "Feed", icon: "▤" },
  { id: "deck", label: "Deck", icon: "🃏" },
  { id: "stats", label: "Stats", icon: "◔" },
];

export function TabBar() {
  const tab = useUiStore((s) => s.tab);
  const setTab = useUiStore((s) => s.setTab);
  const states = useSrsStore((s) => s.states);
  const dueCount = selectDueConceptIds(states, new Date()).length;

  return (
    <nav className="tabbar" aria-label="Views">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tabbar__tab${tab === t.id ? " tabbar__tab--active" : ""}`}
          onClick={() => setTab(t.id)}
          aria-current={tab === t.id ? "page" : undefined}
        >
          <span className="tabbar__icon">
            {t.icon}
            {t.id === "deck" && dueCount > 0 && (
              <span className="tabbar__badge">{dueCount}</span>
            )}
          </span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
