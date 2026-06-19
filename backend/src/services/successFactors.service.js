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

function formatToPan(input) {
  if (!input) return "ABCDE1234F";
  const upper = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(upper)) return upper;
  
  const letters = upper.replace(/[^A-Z]/g, "");
  const digits = upper.replace(/[^0-9]/g, "");
  
  const part1 = (letters + "ABCDE").slice(0, 5);
  const part2 = (digits + "1234").slice(0, 4);
  const part3 = "F";
  return part1 + part2 + part3;
}

function mapCountryCode(c) {
  if (!c) return "IND";
  const cl = c.toUpperCase();
  if (cl === "IN" || cl === "IND") return "IND";
  if (cl === "US" || cl === "USA") return "USA";
  if (cl === "GB" || cl === "GBR") return "GBR";
  return cl;
}

function generateSfUserId(onboardingDoc) {
  if (onboardingDoc.successFactors?.employeeId) {
    return onboardingDoc.successFactors.employeeId;
  }

  if (onboardingDoc.employee?.email) {
    const prefix = onboardingDoc.employee.email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9._-]/g, "");
    
    // Append the last 4 characters of onboardingRequestId to ensure uniqueness in shared tenant
    const suffix = onboardingDoc.onboardingRequestId
      ? onboardingDoc.onboardingRequestId.split("-").pop().slice(-4)
      : Math.floor(1000 + Math.random() * 9000).toString();
      
    return `${prefix}_${suffix}`;
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
  const mapGender = (g) => {
    if (!g) return "U";
    const gl = g.toLowerCase();
    if (gl === "male") return "M";
    if (gl === "female") return "F";
    return "U";
  };

  const mapMarital = (m) => {
    if (!m) return "Single";
    return m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
  };

  return clean({
    __metadata: { uri: "PerPersonal" },
    personIdExternal: sfUserId,
    startDate: toSfDate("1900-01-01"),
    firstName: onboardingDoc.employee?.firstName,
    lastName: onboardingDoc.employee?.lastName,
    gender: mapGender(onboardingDoc.employee?.gender),
    maritalStatus: mapMarital(onboardingDoc.employee?.maritalStatus),
    nationality: mapCountryCode(onboardingDoc.employee?.nationality),
  });
}

function buildPerNationalIdPayload(onboardingDoc, sfUserId) {
  return clean({
    __metadata: { uri: "PerNationalId" },
    personIdExternal: sfUserId,
    nationalId: formatToPan(onboardingDoc.employee?.nationalId),
    cardType: "PAN",
    country: mapCountryCode(onboardingDoc.employee?.nationality),
    isPrimary: true
  });
}

function buildUserPayload(onboardingDoc, sfUserId) {
  return clean({
    __metadata: { uri: `User('${sfUserId}')` },
    userId: sfUserId,
    username: sfUserId,
    email: onboardingDoc.employee?.email,
    firstName: onboardingDoc.employee?.firstName,
    lastName: onboardingDoc.employee?.lastName,
    displayName: `${onboardingDoc.employee?.firstName} ${onboardingDoc.employee?.lastName}`,
    status: "Active",
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
    company: "1910",
    eventReason: "HIRNEW",
    businessUnit: "PRODS",
    division: "MANU",
    location: "1910-0001",
    jobCode: "50071000",
    employeeClass: "4662",
    employmentType: "3637",
    jobTitle: onboardingDoc.employee?.jobTitle || "Employee",
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
    console.log(`[SF-STEP] Skipped step: ${stepName} (reason: No payload fields)`);
    return {
      entity: stepName,
      skipped: true,
      reason: "No payload fields",
    };
  }

  console.log(`[SF-REQUEST] Step: ${stepName} | Payload:`, JSON.stringify(payload, null, 2));

  try {
    const result = await upsertEntity(payload);
    console.log(`[SF-RESPONSE] Step: ${stepName} | Result:`, JSON.stringify(result, null, 2));
    
    const resultsArray = result?.d;
    if (Array.isArray(resultsArray) && resultsArray.length > 0) {
      const firstResult = resultsArray[0];
      if (firstResult.status === "ERROR") {
        throw new Error(firstResult.message || `OData error in step ${stepName}`);
      }
    }

    return {
      entity: stepName,
      success: true,
      payload,
      result,
    };
  } catch (error) {
    const sfErr = extractSfError(error);
    console.error(`[SF-ERROR] Step: ${stepName} | Error:`, JSON.stringify(sfErr, null, 2));
    return {
      entity: stepName,
      success: false,
      payload,
      error: sfErr,
    };
  }
}

export async function createEmployeeInSuccessFactors(onboardingDoc) {
  console.log("SuccessFactors API Call Initiated for employee:", onboardingDoc.employee?.firstName, onboardingDoc.employee?.lastName);
  const sfUserId = generateSfUserId(onboardingDoc);

  const orderedSteps = [
    ["perPerson", buildPerPersonPayload],
    ["empEmployment", buildEmpEmploymentPayload],
    ["perPersonal", buildPerPersonalPayload],
    ["perNationalId", buildPerNationalIdPayload],
    ["user", buildUserPayload],
    ["empJob", buildEmpJobPayload],
  ];

  const uiBase = process.env.SF_UI_URL || "https://salesdemo.successfactors.eu";
  const results = {
    sfUserId,
    profileUrl: `${uiBase}/sf/hrmd?selectedModule=Employee&userId=${encodeURIComponent(sfUserId)}`,
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
