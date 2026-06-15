"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Answer, AnswerMap, AnswerOption, Category, Question } from "@/lib/types";
import { scoreAssessment, summariseStandards } from "@/lib/scoring";
import {
  PathId,
  Snapshot,
  loadDraft,
  saveDraft,
  clearDraft,
  loadHistory,
  saveSnapshot,
  toSnapshot,
} from "@/lib/history";
import Wizard from "./Wizard";
import Results from "./Results";

export interface AssessmentConfig {
  /** Distinguishes saved history/draft between the two paths. */
  path: PathId;
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
  /** Business path only: offer the technical (IT) assessment as a next step on results. */
  showItBridge?: boolean;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-NZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "earlier";
  }
}

export default function Assessment(config: AssessmentConfig) {
  const { path } = config;
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [done, setDone] = useState(false);
  const [previous, setPrevious] = useState<Snapshot | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [resumable, setResumable] = useState<{ savedAt: string; answers: AnswerMap } | null>(null);

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

  // On mount: offer to resume an in-progress draft, and load any past history.
  useEffect(() => {
    const draft = loadDraft(path);
    if (draft && Object.keys(draft.answers).length > 0) {
      setResumable({ savedAt: draft.savedAt, answers: draft.answers });
    }
    setHistory(loadHistory(path));
  }, [path]);

  // Auto-save answers as a draft so an interrupted check can be resumed.
  useEffect(() => {
    if (!done && Object.keys(answers).length > 0) {
      saveDraft(path, answers, new Date().toISOString());
    }
  }, [answers, done, path]);

  const handleAnswer = (id: string, a: Answer) =>
    setAnswers((prev) => ({ ...prev, [id]: a }));

  const finish = () => {
    const takenAt = new Date().toISOString();
    const prior = loadHistory(path);
    setPrevious(prior[0] ?? null); // most recent before this one
    setHistory(saveSnapshot(toSnapshot(path, result, takenAt)));
    clearDraft(path);
    setDone(true);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const restart = () => {
    clearDraft(path);
    setAnswers({});
    setPrevious(null);
    setDone(false);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const resumeNow = () => {
    if (resumable) setAnswers(resumable.answers);
    setResumable(null);
  };

  const startFresh = () => {
    clearDraft(path);
    setResumable(null);
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
            🔒 Private by design. Your answers and results are saved only on this device — never
            uploaded.
          </span>
        </div>
      </header>

      <main className="container">
        {!done && resumable && (
          <div className="resume-banner" role="status">
            <div>
              <strong>Pick up where you left off?</strong>
              <span>
                {" "}
                You have an unfinished check from {formatWhen(resumable.savedAt)}.
              </span>
            </div>
            <div className="resume-actions">
              <button type="button" className="btn btn-primary" onClick={resumeNow}>
                Resume
              </button>
              <button type="button" className="btn btn-ghost" onClick={startFresh}>
                Start fresh
              </button>
            </div>
          </div>
        )}

        {done ? (
          <Results
            result={result}
            onRestart={restart}
            eyebrow={config.resultsEyebrow}
            summaryLabel={config.summaryLabel}
            reportTitle={config.reportTitle}
            standards={standardsSummary}
            showItBridge={config.showItBridge}
            previous={previous}
            history={history}
            path={path}
          />
        ) : (
          <Wizard
            categories={config.categories}
            questions={config.questions}
            answers={answers}
            answerScale={config.answerScale}
            onAnswer={handleAnswer}
            onComplete={finish}
          />
        )}

        <p className="footer">
          <Link href="/" className="home-link">
            ← Back to start
          </Link>
          <br />
          Your results are based on your own answers — this is a self-assessment to guide you, not a
          formal audit or a guarantee of security. It is an informational tool only, not affiliated with
          any insurer and does not sell insurance. For decisions about cover, speak to a licensed adviser.
        </p>
      </main>
    </>
  );
}
