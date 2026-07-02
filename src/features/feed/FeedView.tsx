import { useEffect } from "react";
import { useFeedStore } from "@/store/feedStore";
import { CardScroller } from "./CardScroller";
import { ProgressHUD } from "./ProgressHUD";
import { SessionSummary } from "./SessionSummary";
import { LessonCard } from "@/features/lesson/LessonCard";
import { ExerciseCard } from "@/features/exercise/ExerciseCard";

export function FeedView() {
  const phase = useFeedStore((s) => s.phase);
  const startSession = useFeedStore((s) => s.startSession);

  useEffect(() => {
    if (phase === "loading") void startSession();
  }, [phase, startSession]);

  if (phase === "loading")
    return (
      <div className="loading">
        <span className="wordmark" style={{ fontSize: 34 }}>
          akı<span>ş</span>
        </span>
        <span>Building your session…</span>
      </div>
    );

  return (
    <>
      <ProgressHUD />
      <CardScroller
        renderItem={(item, advance, active) => {
          switch (item.kind) {
            case "lesson":
              return <LessonCard concept={item.concept} card={item.card} />;
            case "exercise":
              return (
                <ExerciseCard
                  concept={item.concept}
                  card={item.card}
                  active={active}
                  onComplete={advance}
                />
              );
            case "summary":
              return <SessionSummary />;
          }
        }}
      />
    </>
  );
}
