import { useEffect } from "react";
import { seedSource } from "@/content/source/SeedSource";
import { buildLinearFeed } from "@/domain/feed/linearFeed";
import { useFeedStore } from "@/store/feedStore";
import { CardScroller } from "./CardScroller";
import { ProgressHUD } from "./ProgressHUD";
import { SessionSummary } from "./SessionSummary";
import { LessonCard } from "@/features/lesson/LessonCard";
import { ExerciseCard } from "@/features/exercise/ExerciseCard";

export function FeedView() {
  const init = useFeedStore((s) => s.init);
  const ready = useFeedStore((s) => s.items.length > 0);

  useEffect(() => {
    init(buildLinearFeed(seedSource));
  }, [init]);

  if (!ready) return null;

  return (
    <>
      <ProgressHUD />
      <CardScroller
        renderItem={(item, advance) => {
          switch (item.kind) {
            case "lesson":
              return <LessonCard concept={item.concept} card={item.card} />;
            case "exercise":
              return (
                <ExerciseCard
                  concept={item.concept}
                  card={item.card}
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
