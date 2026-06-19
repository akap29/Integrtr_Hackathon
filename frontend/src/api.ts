// api.ts
// Thin service layer. Replace the mock bodies with real fetch/axios calls to
// POST /api/onboarding, GET /api/onboarding, GET /api/onboarding/:id,
// POST /api/onboarding/:id/retry once the Express endpoints are live.

import { OnboardingRecord, EmployeeIntake, StepState } from "./types";

const emptyStep = (): StepState => ({
  status: "pending",
  completedAt: null,
  error: null,
  slackTs: null,
});

let MOCK_DB: OnboardingRecord[] = [
  {
    _id: "1",
    requestId: "ONB-20260619-001",
    employeeKey: "john.doe@company.com",
    initiatedBy: { userId: "abhay", name: "Abhay Sharma", email: "abhay@company.com" },
    initiatedAt: "2026-06-19T09:12:00Z",
    employee: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@company.com",
      gender: "Male",
      dob: "1996-03-14",
      country: "IN",
      maritalStatus: "Single",
      nationalId: "IN-4471-2290",
      address: "204 Lake View Residency, Pune, MH",
      jobTitle: "Software Engineer",
      department: "Engineering",
      startDate: "2026-06-20",
      hrName: "Abhay Sharma",
      hrEmail: "abhay@company.com",
    },
    successFactors: {
      personIdExternal: "100045",
      userId: "100045",
      employmentId: "100045",
      deepLink: "https://tenant.successfactors.com/employee/100045",
      createdAt: "2026-06-19T09:13:10Z",
    },
    steps: {
      sfWrite: { status: "success", completedAt: "2026-06-19T09:13:10Z", error: null },
      teamSlack: { status: "success", completedAt: "2026-06-19T09:13:14Z", error: null, slackTs: "1718901234.111" },
      hrSlack: { status: "failed", completedAt: null, error: "channel_not_found" },
    },
    onboardingStatus: "partially_completed",
    retryCount: 1,
    lastRetryAt: "2026-06-19T09:20:00Z",
    nextRetryStep: "hrSlack",
    events: [
      { step: "sfWrite", status: "success", timestamp: "2026-06-19T09:13:10Z", message: "Employee created in SF" },
      { step: "teamSlack", status: "success", timestamp: "2026-06-19T09:13:14Z", message: "Welcome message sent" },
      { step: "hrSlack", status: "failed", timestamp: "2026-06-19T09:13:16Z", message: "Slack API error: channel_not_found" },
    ],
  },
  {
    _id: "2",
    requestId: "ONB-20260618-014",
    employeeKey: "priya.menon@company.com",
    initiatedBy: { userId: "abhay", name: "Abhay Sharma", email: "abhay@company.com" },
    initiatedAt: "2026-06-18T14:02:00Z",
    employee: {
      firstName: "Priya",
      lastName: "Menon",
      email: "priya.menon@company.com",
      gender: "Female",
      dob: "1998-11-02",
      country: "IN",
      maritalStatus: "Married",
      nationalId: "IN-8810-3357",
      address: "12 Sundar Nagar, Bengaluru, KA",
      jobTitle: "Product Designer",
      department: "Design",
      startDate: "2026-06-22",
      hrName: "Abhay Sharma",
      hrEmail: "abhay@company.com",
    },
    successFactors: {
      personIdExternal: "100046",
      userId: "100046",
      employmentId: "100046",
      deepLink: "https://tenant.successfactors.com/employee/100046",
      createdAt: "2026-06-18T14:03:00Z",
    },
    steps: {
      sfWrite: { status: "success", completedAt: "2026-06-18T14:03:00Z", error: null },
      teamSlack: { status: "success", completedAt: "2026-06-18T14:03:05Z", error: null, slackTs: "1718801234.222" },
      hrSlack: { status: "success", completedAt: "2026-06-18T14:03:08Z", error: null, slackTs: "1718801234.223" },
    },
    onboardingStatus: "completed",
    retryCount: 0,
    lastRetryAt: null,
    nextRetryStep: null,
    events: [
      { step: "sfWrite", status: "success", timestamp: "2026-06-18T14:03:00Z", message: "Employee created in SF" },
      { step: "teamSlack", status: "success", timestamp: "2026-06-18T14:03:05Z", message: "Welcome message sent" },
      { step: "hrSlack", status: "success", timestamp: "2026-06-18T14:03:08Z", message: "HR notified" },
    ],
  },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function listOnboardings(): Promise<OnboardingRecord[]> {
  await delay(250);
  return [...MOCK_DB].sort(
    (a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime()
  );
}

export async function getOnboarding(id: string): Promise<OnboardingRecord | undefined> {
  await delay(150);
  return MOCK_DB.find((r) => r._id === id);
}

export async function startOnboarding(
  employee: EmployeeIntake,
  initiatedBy: { userId: string; name: string; email: string }
): Promise<OnboardingRecord> {
  await delay(600);

  const today = new Date();
  const requestId = `ONB-${today.toISOString().slice(0, 10).replace(/-/g, "")}-${String(
    MOCK_DB.length + 1
  ).padStart(3, "0")}`;

  const record: OnboardingRecord = {
    _id: String(MOCK_DB.length + 1),
    requestId,
    employeeKey: employee.email,
    initiatedBy,
    initiatedAt: new Date().toISOString(),
    employee,
    successFactors: {
      personIdExternal: null,
      userId: null,
      employmentId: null,
      deepLink: null,
      createdAt: null,
    },
    steps: { sfWrite: emptyStep(), teamSlack: emptyStep(), hrSlack: emptyStep() },
    onboardingStatus: "pending",
    retryCount: 0,
    lastRetryAt: null,
    nextRetryStep: "sfWrite",
    events: [],
  };

  MOCK_DB = [record, ...MOCK_DB];
  return record;
}

export async function retryStep(id: string, step: string): Promise<OnboardingRecord> {
  await delay(500);
  MOCK_DB = MOCK_DB.map((r) => {
    if (r._id !== id) return r;
    const updated: OnboardingRecord = {
      ...r,
      retryCount: r.retryCount + 1,
      lastRetryAt: new Date().toISOString(),
      steps: {
        ...r.steps,
        [step]: { status: "success", completedAt: new Date().toISOString(), error: null },
      } as OnboardingRecord["steps"],
    };
    const allDone = Object.values(updated.steps).every((s) => s.status === "success");
    updated.onboardingStatus = allDone ? "completed" : "partially_completed";
    updated.nextRetryStep = allDone ? null : updated.nextRetryStep;
    return updated;
  });
  return MOCK_DB.find((r) => r._id === id) as OnboardingRecord;
}
