"use client";

import Assessment from "@/components/Assessment";
import { businessAnswerScale, categories, questions } from "@/lib/questions";

export default function BusinessPage() {
  return (
    <Assessment
      path="business"
      title="For business owners"
      subtitle="A plain-English check for New Zealand businesses. No tech knowledge needed — answer a few questions about how you work and see where you stand."
      categories={categories}
      questions={questions}
      answerScale={businessAnswerScale}
      computeInsurance={true}
      resultsEyebrow="Your cyber maturity"
      reportTitle="Your Cybersecurity Health Check Report"
      showItBridge
    />
  );
}
