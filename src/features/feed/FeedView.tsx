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

  if (phase === "loading") return <p className="loading">Building your session…</p>;

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
