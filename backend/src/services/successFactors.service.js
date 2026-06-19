import axios from "axios";
import { SF_BASE_URL, getBasicAuthHeader } from "../config/successFactors.js";

function sfHeaders() {
  return {
    Authorization: getBasicAuthHeader(),
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function toSfDate(dateValue) {
  if (!dateValue) return null;
  const ts = new Date(dateValue).getTime();
  if (Number.isNaN(ts)) return null;
  return `/Date(${ts})/`;
}

function clean(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== null && v !== undefined && v !== "",
    ),
  );
}

function generateSfUserId(onboardingDoc) {
  if (onboardingDoc.successFactors?.employeeId) {
    return onboardingDoc.successFactors.employeeId;
  }

  if (onboardingDoc.employee?.email) {
    return onboardingDoc.employee.email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9._-]/g, "");
  }

  return onboardingDoc.onboardingRequestId;
}

function buildPerPersonPayload(onboardingDoc, sfUserId) {
  return clean({
    __metadata: { uri: "PerPerson" },
    personIdExternal: sfUserId,
    dateOfBirth: toSfDate(onboardingDoc.employee?.dateOfBirth),
  });
}

function buildPerPersonalPayload(onboardingDoc, sfUserId) {
  return clean({
    __metadata: { uri: "PerPersonal" },
    personIdExternal: sfUserId,
    firstName: onboardingDoc.employee?.firstName,
    lastName: onboardingDoc.employee?.lastName,
    gender: onboardingDoc.employee?.gender,
    maritalStatus: onboardingDoc.employee?.maritalStatus,
    nationality: onboardingDoc.employee?.nationality,
  });
}

function buildPerNationalIdPayload(onboardingDoc, sfUserId) {
  return clean({
    __metadata: { uri: "PerNationalId" },
    personIdExternal: sfUserId,
    cardNumber: onboardingDoc.employee?.nationalId,
  });
}

function buildUserPayload(onboardingDoc, sfUserId) {
  return clean({
    __metadata: { uri: "User" },
    userId: sfUserId,
    username: sfUserId,
    email: onboardingDoc.employee?.email,
    status: "active",
  });
}

function buildEmpEmploymentPayload(onboardingDoc, sfUserId) {
  return clean({
    __metadata: { uri: "EmpEmployment" },
    personIdExternal: sfUserId,
    userId: sfUserId,
    startDate: toSfDate(onboardingDoc.employee?.joiningDate),
  });
}

function buildEmpJobPayload(onboardingDoc, sfUserId) {
  return clean({
    __metadata: { uri: "EmpJob" },
    userId: sfUserId,
    startDate: toSfDate(onboardingDoc.employee?.joiningDate),
    department: onboardingDoc.employee?.department,
    jobTitle: onboardingDoc.employee?.jobTitle,
  });
}

async function upsertEntity(payload) {
  const response = await axios.post(`${SF_BASE_URL}/odata/v2/upsert`, payload, {
    headers: sfHeaders(),
  });

  return response.data;
}

function extractSfError(error) {
  if (error.response?.data) return error.response.data;
  return { message: error.message || "Unknown SuccessFactors error" };
}

async function runEntityStep(
  stepName,
  payloadBuilder,
  onboardingDoc,
  sfUserId,
) {
  const payload = payloadBuilder(onboardingDoc, sfUserId);
  const keys = Object.keys(payload).filter((k) => k !== "__metadata");

  if (keys.length === 0) {
    return {
      entity: stepName,
      skipped: true,
      reason: "No payload fields",
    };
  }

  try {
    const result = await upsertEntity(payload);
    return {
      entity: stepName,
      success: true,
      payload,
      result,
    };
  } catch (error) {
    return {
      entity: stepName,
      success: false,
      payload,
      error: extractSfError(error),
    };
  }
}

export async function createEmployeeInSuccessFactors(onboardingDoc) {
  const sfUserId = generateSfUserId(onboardingDoc);

  const orderedSteps = [
    ["perPerson", buildPerPersonPayload],
    ["perPersonal", buildPerPersonalPayload],
    ["perNationalId", buildPerNationalIdPayload],
    ["user", buildUserPayload],
    ["empEmployment", buildEmpEmploymentPayload],
    ["empJob", buildEmpJobPayload],
  ];

  const results = {
    sfUserId,
    profileUrl: `${SF_BASE_URL}/odata/v2/User('${encodeURIComponent(sfUserId)}')`,
    entities: {},
  };

  for (const [stepName, builder] of orderedSteps) {
    const stepResult = await runEntityStep(
      stepName,
      builder,
      onboardingDoc,
      sfUserId,
    );
    results.entities[stepName] = stepResult;

    if (stepResult.success === false) {
      const err = new Error(`SuccessFactors entity failed: ${stepName}`);
      err.step = stepName;
      err.results = results;
      throw err;
    }
  }

  return results;
}
