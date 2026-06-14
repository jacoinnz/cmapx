"use client";

import Assessment from "@/components/Assessment";
import { IT_STANDARDS, itAnswerScale, itCategories, itQuestions } from "@/lib/itQuestions";

export default function ItPage() {
  return (
    <Assessment
      title="Cybersecurity Health Check — for IT people"
      subtitle="A technical control assessment for New Zealand organisations, mapped to NZISM, PSR, Essential Eight, ISO 27001 and HISF. Rate each control by how fully it's implemented."
      categories={itCategories}
      questions={itQuestions}
      answerScale={itAnswerScale}
      computeInsurance={false}
      standards={IT_STANDARDS}
      resultsEyebrow="Your technical maturity"
      reportTitle="Your Technical Cybersecurity Maturity Report"
    />
  );
}
