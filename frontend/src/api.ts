// api.ts
// Real API calls to the Express endpoints.

import { OnboardingRecord, EmployeeIntake } from "./types";

function mapBackendToFrontend(backendDoc: any): OnboardingRecord {
  const employee = backendDoc.employee || {};
  const hr = backendDoc.hr || {};
  const steps = backendDoc.steps || {};
  const sf = backendDoc.successFactors || {};

  const formatGender = (g: string) => {
    if (!g) return "";
    const gl = g.toLowerCase();
    if (gl === "male") return "Male";
    if (gl === "female") return "Female";
    if (gl === "other") return "Other";
    return g;
  };

  const formatMarital = (m: string) => {
    if (!m) return "";
    return m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
  };

  const fmtDateString = (d: any) => {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  };

  const events: any[] = [];
  if (steps.sf_write && steps.sf_write.status !== "pending") {
    events.push({
      step: "sfWrite",
      status: steps.sf_write.status,
      timestamp: steps.sf_write.executedAt || new Date().toISOString(),
      message: steps.sf_write.status === "success" ? "Employee created in SF" : `SuccessFactors error: ${steps.sf_write.error || "Unknown error"}`
    });
  }
  if (steps.team_slack && steps.team_slack.status !== "pending") {
    events.push({
      step: "teamSlack",
      status: steps.team_slack.status,
      timestamp: steps.team_slack.executedAt || new Date().toISOString(),
      message: steps.team_slack.status === "success" ? "Welcome message sent" : `Slack API error: ${steps.team_slack.error || "Unknown error"}`
    });
  }
  if (steps.hr_slack && steps.hr_slack.status !== "pending") {
    events.push({
      step: "hrSlack",
      status: steps.hr_slack.status,
      timestamp: steps.hr_slack.executedAt || new Date().toISOString(),
      message: steps.hr_slack.status === "success" ? "HR notified" : `Slack API error: ${steps.hr_slack.error || "Unknown error"}`
    });
  }

  const nextRetryStep = backendDoc.overallStatus === "completed" ? null : 
    (steps.sf_write?.status !== "success" ? "sfWrite" :
     steps.team_slack?.status !== "success" ? "teamSlack" :
     steps.hr_slack?.status !== "success" ? "hrSlack" : null);

  return {
    _id: backendDoc._id,
    requestId: backendDoc.onboardingRequestId,
    employeeKey: employee.email || "",
    initiatedBy: {
      userId: hr.email ? hr.email.split("@")[0] : "hr",
      name: hr.name || "",
      email: hr.email || ""
    },
    initiatedAt: backendDoc.initiatedAt || backendDoc.createdAt || new Date().toISOString(),
    employee: {
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      gender: formatGender(employee.gender || ""),
      dob: fmtDateString(employee.dateOfBirth),
      country: employee.nationality || "",
      maritalStatus: formatMarital(employee.maritalStatus || ""),
      nationalId: employee.nationalId || "",
      address: "",
      jobTitle: employee.jobTitle || "",
      department: employee.department || "",
      startDate: fmtDateString(employee.joiningDate),
      hrName: hr.name || "",
      hrEmail: hr.email || ""
    },
    successFactors: {
      personIdExternal: sf.employeeId || null,
      userId: sf.employeeId || null,
      employmentId: sf.employeeId || null,
      deepLink: sf.profileUrl || null,
      createdAt: steps.sf_write?.executedAt || null
    },
    steps: {
      sfWrite: {
        status: steps.sf_write?.status || "pending",
        completedAt: steps.sf_write?.executedAt || null,
        error: steps.sf_write?.error || null
      },
      teamSlack: {
        status: steps.team_slack?.status || "pending",
        completedAt: steps.team_slack?.executedAt || null,
        error: steps.team_slack?.error || null
      },
      hrSlack: {
        status: steps.hr_slack?.status || "pending",
        completedAt: steps.hr_slack?.executedAt || null,
        error: steps.hr_slack?.error || null
      }
    },
    onboardingStatus: backendDoc.overallStatus === "partially_failed" ? "partially_completed" : backendDoc.overallStatus,
    retryCount: backendDoc.retryCount || 0,
    lastRetryAt: backendDoc.updatedAt || null,
    nextRetryStep,
    events
  };
}

function mapFrontendToBackend(employee: EmployeeIntake, initiatedBy: { name: string; email: string }) {
  const mapGender = (g: string) => {
    if (!g) return "other";
    const gl = g.toLowerCase();
    if (gl === "male") return "male";
    if (gl === "female") return "female";
    return "other";
  };

  const mapMarital = (m: string) => {
    if (!m) return "single";
    const ml = m.toLowerCase();
    if (["single", "married", "divorced", "widowed"].includes(ml)) return ml;
    return "single";
  };

  return {
    employee: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      maritalStatus: mapMarital(employee.maritalStatus),
      nationalId: employee.nationalId,
      email: employee.email,
      dateOfBirth: employee.dob,
      gender: mapGender(employee.gender),
      nationality: employee.country,
      department: employee.department,
      jobTitle: employee.jobTitle,
      designation: employee.jobTitle,
      joiningDate: employee.startDate
    },
    hr: {
      name: initiatedBy.name,
      email: initiatedBy.email
    }
  };
}

export async function listOnboardings(): Promise<OnboardingRecord[]> {
  const response = await fetch("/api/onboarding");
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  const result = await response.json();
  return (result.data || []).map(mapBackendToFrontend);
}

export async function getOnboarding(id: string): Promise<OnboardingRecord | undefined> {
  const response = await fetch(`/api/onboarding/${id}`);
  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error(`API error: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data ? mapBackendToFrontend(result.data) : undefined;
}

export async function startOnboarding(
  employee: EmployeeIntake,
  initiatedBy: { userId: string; name: string; email: string }
): Promise<OnboardingRecord> {
  const payload = mapFrontendToBackend(employee, initiatedBy);
  const response = await fetch("/api/onboarding", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const text = await response.text();
    let message = response.statusText;
    try {
      const json = JSON.parse(text);
      if (json.message) message = json.message;
    } catch (_) {}
    throw new Error(`API error: ${message}`);
  }
  const result = await response.json();
  return mapBackendToFrontend(result.data);
}

export async function retryStep(id: string, step: string): Promise<OnboardingRecord> {
  const response = await fetch(`/api/onboarding/${id}/retry`, {
    method: "POST"
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  const result = await response.json();
  return mapBackendToFrontend(result.data);
}
