import { useShallow } from "zustand/react/shallow";
import { useFeedStore, selectStats } from "@/store/feedStore";

export function ProgressHUD() {
  const index = useFeedStore((s) => s.index);
  const total = useFeedStore((s) => s.items.length);
  const stats = useFeedStore(useShallow(selectStats));

  if (total === 0) return null;
  return (
    <header className="hud">
      <span>
        {Math.min(index + 1, total)} / {total}
      </span>
      <span className="hud__correct">
        ✓ {stats.correct}
        {stats.incorrect > 0 && (
          <span style={{ color: "var(--incorrect)" }}> ✗ {stats.incorrect}</span>
        )}
      </span>
    </header>
  );
}
