// PersonalDetailsForm.tsx
import React, { useState } from "react";
import { PersonalDetails } from "./types";
import { Field, inputClass } from "./FormField";
import { IntakeStepHeader } from "./IntakeStepHeader";

interface Props {
  initial: PersonalDetails;
  onBack: () => void;
  onNext: (values: PersonalDetails) => void;
}

type Errors = Partial<Record<keyof PersonalDetails, string>>;

function validate(values: PersonalDetails): Errors {
  const errors: Errors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required";
  if (!values.lastName.trim()) errors.lastName = "Last name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email";
  if (!values.gender) errors.gender = "Select a gender";
  if (!values.dob) errors.dob = "Date of birth is required";
  if (!values.maritalStatus) errors.maritalStatus = "Select a marital status";
  if (!values.nationalId.trim()) errors.nationalId = "National ID is required";
  if (!values.address.trim()) errors.address = "Address is required";
  return errors;
}

export function PersonalDetailsForm({ initial, onBack, onNext }: Props) {
  const [values, setValues] = useState<PersonalDetails>(initial);
  const [errors, setErrors] = useState<Errors>({});

  function update<K extends keyof PersonalDetails>(key: K, value: PersonalDetails[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onNext(values);
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="h-1.5 w-full bg-gradient-to-r from-iris-600 via-iris-400 to-aqua-500" />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={onBack} className="text-sm text-ink-500 hover:text-ink-800 mb-6 flex items-center gap-1">
          ← Back to dashboard
        </button>

        <IntakeStepHeader
          step={1}
          eyebrow="New onboarding · step 1 of 2"
          title="Personal details"
          subtitle="Let's start with who they are. Employment details come next."
        />

        <form onSubmit={handleSubmit} className="bg-white border border-ink-100 rounded-2xl shadow-sm shadow-iris-100/40 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" error={errors.firstName}>
              <input
                className={inputClass}
                value={values.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="John"
              />
            </Field>
            <Field label="Last name" error={errors.lastName}>
              <input
                className={inputClass}
                value={values.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                placeholder="Doe"
              />
            </Field>
          </div>

          <Field label="Personal email" error={errors.email}>
            <input
              type="email"
              className={inputClass}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="john.doe@email.com"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Gender" error={errors.gender}>
              <select
                className={inputClass}
                value={values.gender}
                onChange={(e) => update("gender", e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </Field>
            <Field label="Date of birth" error={errors.dob}>
              <input
                type="date"
                className={inputClass}
                value={values.dob}
                onChange={(e) => update("dob", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Country" error={errors.country}>
              <select
                className={inputClass}
                value={values.country}
                onChange={(e) => update("country", e.target.value)}
              >
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
              </select>
            </Field>
            <Field label="Marital status" error={errors.maritalStatus}>
              <select
                className={inputClass}
                value={values.maritalStatus}
                onChange={(e) => update("maritalStatus", e.target.value)}
              >
                <option value="">Select status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </Field>
          </div>

          <Field label="National ID" error={errors.nationalId}>
            <input
              className={inputClass}
              value={values.nationalId}
              onChange={(e) => update("nationalId", e.target.value)}
              placeholder="e.g. Aadhaar, SSN, passport number"
            />
          </Field>

          <Field label="Address" error={errors.address}>
            <textarea
              className={`${inputClass} min-h-[80px] resize-none`}
              value={values.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="House no., street, city, state"
            />
          </Field>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-iris-600 to-aqua-500 text-white text-sm font-medium px-5 py-2.5 shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Continue to employment details →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
