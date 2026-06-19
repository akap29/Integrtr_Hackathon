// OnboardingFlow.tsx
// Orchestrates the two-step intake: Personal details first, Employment details second.
import React, { useState } from "react";
import { EmploymentDetails, PersonalDetails } from "./types";
import { startOnboarding } from "./api";
import { PersonalDetailsForm } from "./PersonalDetailsForm";
import { EmploymentDetailsForm } from "./EmploymentDetailsForm";

interface Props {
  currentUser: { userId: string; name: string; email: string };
  onBack: () => void;
  onCreated: (id: string) => void;
}

const EMPTY_PERSONAL: PersonalDetails = {
  firstName: "",
  lastName: "",
  email: "",
  gender: "",
  dob: "",
  country: "IN",
  maritalStatus: "",
  nationalId: "",
  address: "",
};

const EMPTY_EMPLOYMENT: EmploymentDetails = {
  jobTitle: "",
  department: "",
  startDate: "",
  hrName: "",
  hrEmail: "",
};

export function OnboardingFlow({ currentUser, onBack, onCreated }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [personal, setPersonal] = useState<PersonalDetails>(EMPTY_PERSONAL);
  const [submitting, setSubmitting] = useState(false);

  if (step === 1) {
    return (
      <PersonalDetailsForm
        initial={personal}
        onBack={onBack}
        onNext={(values) => {
          setPersonal(values);
          setStep(2);
        }}
      />
    );
  }

  return (
    <EmploymentDetailsForm
      initial={EMPTY_EMPLOYMENT}
      submitting={submitting}
      initiatedByName={currentUser.name}
      onBack={() => setStep(1)}
      onSubmit={async (employment) => {
        setSubmitting(true);
        try {
          const record = await startOnboarding({ ...personal, ...employment }, currentUser);
          onCreated(record._id);
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
