"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Answer, AnswerMap, AnswerOption, Category, Question } from "@/lib/types";
import { scoreAssessment, summariseStandards } from "@/lib/scoring";
import Wizard from "./Wizard";
import Results from "./Results";

export interface AssessmentConfig {
  title: string;
  subtitle: string;
  categories: Category[];
  questions: Question[];
  answerScale: AnswerOption[];
  computeInsurance: boolean;
  /** Standards to summarise in results (IT path). */
  standards?: string[];
  resultsEyebrow?: string;
  /** Word used in the summary sentence: "Your <label> maturity is …". */
  summaryLabel?: string;
  reportTitle?: string;
}

export default function Assessment(config: AssessmentConfig) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [done, setDone] = useState(false);

  const creditByValue = useMemo(
    () => Object.fromEntries(config.answerScale.map((o) => [o.value, o.credit])),
    [config.answerScale]
  );

  const result = useMemo(
    () =>
      scoreAssessment(answers, config.questions, config.categories, {
        creditByValue,
        computeInsurance: config.computeInsurance,
      }),
    [answers, config.questions, config.categories, creditByValue, config.computeInsurance]
  );

  const standardsSummary = useMemo(
    () =>
      config.standards
        ? summariseStandards(answers, config.questions, config.standards, creditByValue)
        : undefined,
    [answers, config.questions, config.standards, creditByValue]
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
          <Link href="/" className="brand brand-link" aria-label="Return to start">
            <span className="logo-badge" aria-hidden />
            <strong>Cybersecurity Maturity Health Check</strong>
          </Link>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
          <span className="privacy-note">
            🔒 We store nothing. Your answers stay in your browser and disappear when you close the tab.
          </span>
        </div>
      </header>

      <main className="container">
        {done ? (
          <Results
            result={result}
            onRestart={restart}
            eyebrow={config.resultsEyebrow}
            summaryLabel={config.summaryLabel}
            reportTitle={config.reportTitle}
            standards={standardsSummary}
          />
        ) : (
          <Wizard
            categories={config.categories}
            questions={config.questions}
            answers={answers}
            answerScale={config.answerScale}
            onAnswer={handleAnswer}
            onComplete={() => {
              setDone(true);
              if (typeof window !== "undefined") window.scrollTo(0, 0);
            }}
          />
        )}

        <p className="footer">
          <Link href="/" className="home-link">
            ← Back to start
          </Link>
          <br />
          This is an informational tool only. It is not affiliated with any insurer and does not sell
          insurance. For decisions about cover, speak to a licensed adviser.
        </p>
      </main>
    </>
  );
}
