import { useEffect } from "react";
import { FeedView } from "@/features/feed/FeedView";
import { DeckView } from "@/features/review/DeckView";
import { StatsView } from "@/features/stats/StatsView";
import { TabBar } from "@/features/nav/TabBar";
import { useUiStore } from "@/store/uiStore";
import { useSrsStore, ensurePersistentStorage } from "@/store/srsStore";

export function App() {
  const tab = useUiStore((s) => s.tab);
  const load = useSrsStore((s) => s.load);
  const loaded = useSrsStore((s) => s.loaded);

  useEffect(() => {
    void ensurePersistentStorage();
    void load();
  }, [load]);

  if (!loaded) return <p className="loading">Loading…</p>;

  return (
    <div className="app">
      <div className="app__view">
        {tab === "feed" && <FeedView />}
        {tab === "deck" && <DeckView />}
        {tab === "stats" && <StatsView />}
      </div>
      <TabBar />
    </div>
  );
}
