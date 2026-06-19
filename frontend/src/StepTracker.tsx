// StepTracker.tsx
import React, { useState } from "react";
import { OnboardingRecord, STEP_LABELS } from "./types";
import { StepDot } from "./StatusBadge";
import { retryStep } from "./api";

interface Props {
  record: OnboardingRecord;
  onChange: (updated: OnboardingRecord) => void;
}

export function StepTracker({ record, onChange }: Props) {
  const [retrying, setRetrying] = useState<string | null>(null);
  const stepKeys = Object.keys(record.steps) as (keyof OnboardingRecord["steps"])[];

  async function handleRetry(step: string) {
    setRetrying(step);
    try {
      const updated = await retryStep(record._id, step);
      onChange(updated);
    } finally {
      setRetrying(null);
    }
  }

  return (
    <div className="space-y-0">
      {stepKeys.map((key, idx) => {
        const step = record.steps[key];
        const isLast = idx === stepKeys.length - 1;
        return (
          <div key={key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepDot status={step.status} />
              {!isLast && <span className="w-px flex-1 bg-stone-200" style={{ minHeight: 28 }} />}
            </div>
            <div className="pb-5 -mt-0.5 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-stone-800">{STEP_LABELS[key]}</p>
                {step.status === "failed" && (
                  <button
                    onClick={() => handleRetry(key)}
                    disabled={retrying === key}
                    className="text-xs font-medium text-amber-700 border border-amber-300 rounded-md px-2 py-1 hover:bg-amber-50 disabled:opacity-50"
                  >
                    {retrying === key ? "Retrying…" : "Retry step"}
                  </button>
                )}
              </div>
              <p className="text-xs font-mono text-stone-500 mt-0.5">
                {step.status === "success" && step.completedAt
                  ? `done · ${new Date(step.completedAt).toLocaleString()}`
                  : step.status === "failed"
                  ? `failed · ${step.error ?? "unknown error"}`
                  : step.status === "in_progress"
                  ? "running…"
                  : "waiting"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
