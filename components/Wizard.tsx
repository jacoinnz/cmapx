"use client";

import { useState } from "react";
import { Answer, AnswerMap, AnswerOption, Category, Question } from "@/lib/types";

function QuestionRow({
  question,
  value,
  scale,
  onAnswer,
}: {
  question: Question;
  value: Answer | undefined;
  scale: AnswerOption[];
  onAnswer: (a: Answer) => void;
}) {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div className="question">
      <p className="q-text">{question.text}</p>
      {question.standards && question.standards.length > 0 && (
        <div className="q-standards">
          {question.standards.map((s) => (
            <span className="std-tag" key={s}>
              {s}
            </span>
          ))}
        </div>
      )}
      {question.helpText && (
        <>
          <button className="help-toggle" onClick={() => setShowHelp((s) => !s)}>
            {showHelp ? "Hide" : "Why does this matter?"}
          </button>
          {showHelp && <p className="help-text">{question.helpText}</p>}
        </>
      )}
      <div className="answers" role="group" aria-label={question.text}>
        {(question.scale ?? scale).map((o) => (
          <button
            key={o.value}
            className="answer-btn"
            data-selected={value === o.value ? o.value : undefined}
            data-on={value === o.value ? "true" : undefined}
            aria-pressed={value === o.value}
            onClick={() => onAnswer(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Wizard({
  categories,
  questions,
  answers,
  answerScale,
  onAnswer,
  onComplete,
}: {
  categories: Category[];
  questions: Question[];
  answers: AnswerMap;
  answerScale: AnswerOption[];
  onAnswer: (id: string, a: Answer) => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const category = categories[step];
  const catQuestions = questions.filter((q) => q.categoryId === category.id);
  const allAnswered = catQuestions.every((q) => answers[q.id]);
  const isLast = step === categories.length - 1;
  const pct = Math.round(((step + (allAnswered ? 1 : 0)) / categories.length) * 100);

  const next = () => {
    if (!allAnswered) return;
    if (isLast) onComplete();
    else setStep((s) => s + 1);
  };

  return (
    <div className="card">
      <div className="progress" aria-hidden>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-label">
        Section {step + 1} of {categories.length}
      </div>

      <div className="cat-eyebrow">Cybersecurity check</div>
      <h2 className="cat-title">{category.ownerLabel}</h2>
      <p className="cat-desc">{category.description}</p>

      {catQuestions.map((q) => (
        <QuestionRow
          key={q.id}
          question={q}
          value={answers[q.id]}
          scale={answerScale}
          onAnswer={(a) => onAnswer(q.id, a)}
        />
      ))}

      <div className="nav-row">
        <button
          className="btn btn-ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{ visibility: step === 0 ? "hidden" : "visible" }}
        >
          ← Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {!allAnswered && <span className="hint">Please answer every question to continue</span>}
          <button className="btn btn-primary" onClick={next} disabled={!allAnswered}>
            {isLast ? "See my results" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
