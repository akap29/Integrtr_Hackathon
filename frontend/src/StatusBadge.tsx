// StatusBadge.tsx
import React from "react";
import { OnboardingStatus, StepStatus } from "./types";

const STATUS_STYLES: Record<OnboardingStatus, string> = {
  completed: "bg-teal-50 text-teal-800 border-teal-200",
  partially_completed: "bg-amber-50 text-amber-800 border-amber-200",
  in_progress: "bg-blue-50 text-blue-800 border-blue-200",
  pending: "bg-stone-100 text-stone-600 border-stone-200",
  failed: "bg-rose-50 text-rose-800 border-rose-200",
};

const STATUS_LABEL: Record<OnboardingStatus, string> = {
  completed: "Completed",
  partially_completed: "Needs attention",
  in_progress: "In progress",
  pending: "Pending",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: OnboardingStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${STATUS_STYLES[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "completed"
            ? "bg-teal-600"
            : status === "partially_completed"
            ? "bg-amber-600"
            : status === "in_progress"
            ? "bg-blue-600"
            : status === "failed"
            ? "bg-rose-600"
            : "bg-stone-400"
        }`}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

const STEP_DOT: Record<StepStatus, string> = {
  success: "bg-teal-600 border-teal-600",
  failed: "bg-rose-600 border-rose-600",
  in_progress: "bg-blue-600 border-blue-600 animate-pulse",
  pending: "bg-white border-stone-300",
};

export function StepDot({ status }: { status: StepStatus }) {
  return <span className={`block h-2.5 w-2.5 rounded-full border ${STEP_DOT[status]}`} />;
}
