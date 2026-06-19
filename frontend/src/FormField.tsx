// FormField.tsx
// Shared field wrapper + input styling for the onboarding intake steps.
import React from "react";

export function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-600 mb-1.5 block">
        {label}
        {optional && <span className="text-ink-400 font-normal"> (optional)</span>}
      </span>
      {children}
      {error && <span className="text-xs text-rose-600 mt-1 block">{error}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-ink-100 bg-white px-3 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-iris-400 focus:border-iris-400 transition-shadow";
