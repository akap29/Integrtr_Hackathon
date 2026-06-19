// IntakeStepHeader.tsx
import React from "react";

interface Props {
  step: 1 | 2;
  eyebrow: string;
  title: string;
  subtitle: string;
}

const STEPS: { n: 1 | 2; label: string }[] = [
  { n: 1, label: "Personal details" },
  { n: 2, label: "Employment details" },
];

export function IntakeStepHeader({ step, eyebrow, title, subtitle }: Props) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-5">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className="flex items-center gap-2">
              <span
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  s.n === step
                    ? "bg-gradient-to-br from-iris-600 to-aqua-500 text-white"
                    : s.n < step
                    ? "bg-aqua-500 text-white"
                    : "bg-ink-100 text-ink-400"
                }`}
              >
                {s.n < step ? "✓" : s.n}
              </span>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  s.n === step ? "text-ink-800" : "text-ink-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={`h-px w-8 ${s.n < step ? "bg-aqua-400" : "bg-ink-100"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <p className="text-xs font-data uppercase tracking-widest text-iris-600 mb-1">{eyebrow}</p>
      <h1 className="text-2xl font-display font-semibold text-ink-900 mb-1">{title}</h1>
      <p className="text-sm text-ink-500">{subtitle}</p>
    </div>
  );
}
