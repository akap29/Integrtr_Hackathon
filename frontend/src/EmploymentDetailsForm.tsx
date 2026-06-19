// EmploymentDetailsForm.tsx
import React, { useState } from "react";
import { EmploymentDetails } from "./types";
import { Field, inputClass } from "./FormField";
import { IntakeStepHeader } from "./IntakeStepHeader";

interface Props {
  initial: EmploymentDetails;
  submitting: boolean;
  initiatedByName: string;
  onBack: () => void;
  onSubmit: (values: EmploymentDetails) => void;
}

type Errors = Partial<Record<keyof EmploymentDetails, string>>;

function validate(values: EmploymentDetails): Errors {
  const errors: Errors = {};
  if (!values.jobTitle.trim()) errors.jobTitle = "Job title is required";
  if (!values.department.trim()) errors.department = "Department is required";
  if (!values.startDate) errors.startDate = "Start date is required";
  if (!values.hrName.trim()) errors.hrName = "HR name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.hrEmail)) errors.hrEmail = "Enter a valid HR email";
  return errors;
}

export function EmploymentDetailsForm({ initial, submitting, initiatedByName, onBack, onSubmit }: Props) {
  const [values, setValues] = useState<EmploymentDetails>(initial);
  const [errors, setErrors] = useState<Errors>({});

  function update<K extends keyof EmploymentDetails>(key: K, value: EmploymentDetails[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit(values);
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="h-1.5 w-full bg-gradient-to-r from-iris-600 via-iris-400 to-aqua-500" />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={onBack} className="text-sm text-ink-500 hover:text-ink-800 mb-6 flex items-center gap-1">
          ← Back to personal details
        </button>

        <IntakeStepHeader
          step={2}
          eyebrow="New onboarding · step 2 of 2"
          title="Employment details"
          subtitle="These fields create the record in SuccessFactors and trigger the Slack notifications."
        />

        <form onSubmit={handleSubmit} className="bg-white border border-ink-100 rounded-2xl shadow-sm shadow-iris-100/40 p-6 space-y-5">
          <Field label="Job title" error={errors.jobTitle}>
            <input
              className={inputClass}
              value={values.jobTitle}
              onChange={(e) => update("jobTitle", e.target.value)}
              placeholder="Software Engineer"
            />
          </Field>

          <Field label="Department" error={errors.department}>
            <input
              className={inputClass}
              value={values.department}
              onChange={(e) => update("department", e.target.value)}
              placeholder="Engineering"
            />
          </Field>

          <Field label="Start date" error={errors.startDate}>
            <input
              type="date"
              className={inputClass}
              value={values.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="HR name" error={errors.hrName}>
              <input
                className={inputClass}
                value={values.hrName}
                onChange={(e) => update("hrName", e.target.value)}
                placeholder="Abhay Sharma"
              />
            </Field>
            <Field label="HR email" error={errors.hrEmail}>
              <input
                type="email"
                className={inputClass}
                value={values.hrEmail}
                onChange={(e) => update("hrEmail", e.target.value)}
                placeholder="hr@company.com"
              />
            </Field>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gradient-to-r from-iris-600 to-aqua-500 text-white text-sm font-medium px-5 py-2.5 shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Creating employee…" : "Create employee"}
            </button>
            <span className="text-xs text-ink-400">Initiated by {initiatedByName}</span>
          </div>
        </form>
      </div>
    </div>
  );
}
