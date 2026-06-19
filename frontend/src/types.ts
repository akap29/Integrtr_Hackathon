// types.ts
// Mirrors the employee_onboardings MongoDB schema (workflow ledger, not the employee record).

export type StepStatus = "pending" | "in_progress" | "success" | "failed";

export type OnboardingStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "partially_completed"
  | "failed";

export interface StepState {
  status: StepStatus;
  completedAt: string | null;
  error: string | null;
  slackTs?: string | null;
}

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dob: string; // ISO date
  country: string;
  maritalStatus: string;
  nationalId: string;
  address: string;
}

export interface EmploymentDetails {
  jobTitle: string;
  department: string;
  startDate: string; // ISO date
  hrName: string;
  hrEmail: string;
}

export type EmployeeIntake = PersonalDetails & EmploymentDetails;

export interface SuccessFactorsRefs {
  personIdExternal: string | null;
  userId: string | null;
  employmentId: string | null;
  deepLink: string | null;
  createdAt: string | null;
}

export interface OnboardingEvent {
  step: string;
  status: StepStatus;
  timestamp: string;
  message: string;
}

export interface OnboardingRecord {
  _id: string;
  requestId: string;
  employeeKey: string;
  initiatedBy: { userId: string; name: string; email: string };
  initiatedAt: string;
  employee: EmployeeIntake;
  successFactors: SuccessFactorsRefs;
  steps: {
    sfWrite: StepState;
    teamSlack: StepState;
    hrSlack: StepState;
  };
  onboardingStatus: OnboardingStatus;
  retryCount: number;
  lastRetryAt: string | null;
  nextRetryStep: string | null;
  events: OnboardingEvent[];
}

export const STEP_LABELS: Record<keyof OnboardingRecord["steps"], string> = {
  sfWrite: "SuccessFactors",
  teamSlack: "Team Slack",
  hrSlack: "HR Slack",
};
