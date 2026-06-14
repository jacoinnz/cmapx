"use client";

import { useMemo, useState } from "react";
import { Answer, AnswerMap } from "@/lib/types";
import { categories, questions } from "@/lib/questions";
import { scoreAssessment } from "@/lib/scoring";
import Wizard from "@/components/Wizard";
import Results from "@/components/Results";

export default function Home() {
  // All answers live here in memory only — never persisted, never sent anywhere.
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [done, setDone] = useState(false);

  const result = useMemo(
    () => scoreAssessment(answers, questions, categories),
    [answers]
  );

  const handleAnswer = (id: string, a: Answer) =>
    setAnswers((prev) => ({ ...prev, [id]: a }));

  const restart = () => {
    setAnswers({});
    setDone(false);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="brand">
            <span className="logo-badge">C</span>
            <strong>CMAP</strong>
          </div>
          <h1>How strong is your business against cyber threats?</h1>
          <p>
            A free, plain-English check for New Zealand businesses. No tech knowledge needed —
            answer a few questions about how you work and see where you stand.
          </p>
          <span className="privacy-note">
            🔒 We store nothing. Your answers stay in your browser and disappear when you close the tab.
          </span>
        </div>
      </header>

      <main className="container">
        {done ? (
          <Results result={result} onRestart={restart} />
        ) : (
          <Wizard
            categories={categories}
            questions={questions}
            answers={answers}
            onAnswer={handleAnswer}
            onComplete={() => {
              setDone(true);
              if (typeof window !== "undefined") window.scrollTo(0, 0);
            }}
          />
        )}

        <p className="footer">
          CMAP is an informational tool only. It is not affiliated with any insurer and does not
          sell insurance. For decisions about cover, speak to a licensed adviser.
        </p>
      </main>
    </>
  );
}
