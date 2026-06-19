import EmployeeOnboarding from "../models/EmployeeOnboarding.js";
import { createEmployeeInSuccessFactors } from "./successFactors.service.js";
import { v4 as uuidv4 } from "uuid";
import {
  sendTeamWelcomeMessage,
  sendHrNotificationMessage,
} from "./slack.service.js";

function now() {
  return new Date();
}

export async function processOnboardingToSuccessFactors(onboardingRequestId) {
  const onboarding = await EmployeeOnboarding.findOne({
    onboardingRequestId,
  }).select("+employee.nationalId");

  if (!onboarding) {
    throw new Error("Onboarding request not found");
  }

  if (onboarding.steps.hr_slack.status === "success") {
    return onboarding;
  }

  onboarding.overallStatus = "in_progress";
  await onboarding.save();

  try {
    if (onboarding.steps.sf_write.status !== "success") {
      const sfResult = await createEmployeeInSuccessFactors(onboarding);

      onboarding.successFactors.employeeId = sfResult.sfUserId;
      onboarding.successFactors.profileUrl = sfResult.profileUrl;

      onboarding.steps.sf_write.status = "success";
      onboarding.steps.sf_write.error = null;
      onboarding.steps.sf_write.executedAt = now();

      await onboarding.save();
    }
  } catch (error) {
    onboarding.steps.sf_write.status = "failed";
    onboarding.steps.sf_write.error = error.step
      ? `${error.message} | failedEntity=${error.step}`
      : error.message;
    onboarding.steps.sf_write.executedAt = now();
    onboarding.overallStatus = "partially_failed";

    await onboarding.save();
    throw error;
  }

  const slackEmployeeData = {
    fullName: `${onboarding.employee.firstName} ${onboarding.employee.lastName}`,
    employeeId: onboarding.successFactors?.employeeId || "pending",
    role: onboarding.employee.jobTitle || "",
    department: onboarding.employee.department || "",
    startDate: onboarding.employee.joiningDate
      ? new Date(onboarding.employee.joiningDate).toLocaleDateString()
      : "",
    email: onboarding.employee.email || "",
    avatarUrl: "",
  };

  try {
    if (onboarding.steps.team_slack.status !== "success") {
      await sendTeamWelcomeMessage(slackEmployeeData);

      onboarding.steps.team_slack.status = "success";
      onboarding.steps.team_slack.error = null;
      onboarding.steps.team_slack.executedAt = now();

      await onboarding.save();
    }
  } catch (error) {
    onboarding.steps.team_slack.status = "failed";
    onboarding.steps.team_slack.error = error.message;
    onboarding.steps.team_slack.executedAt = now();
    onboarding.overallStatus = "partially_failed";

    await onboarding.save();
    throw error;
  }

  try {
    if (onboarding.steps.hr_slack.status !== "success") {
      await sendHrNotificationMessage(slackEmployeeData);

      onboarding.steps.hr_slack.status = "success";
      onboarding.steps.hr_slack.error = null;
      onboarding.steps.hr_slack.executedAt = now();

      await onboarding.save();
    }
  } catch (error) {
    onboarding.steps.hr_slack.status = "failed";
    onboarding.steps.hr_slack.error = error.message;
    onboarding.steps.hr_slack.executedAt = now();
    onboarding.overallStatus = "partially_failed";

    await onboarding.save();
    throw error;
  }

  onboarding.overallStatus = "completed";
  await onboarding.save();

  return onboarding;
}

export async function retryOnboardingFlow(onboardingRequestId) {
  const onboarding = await EmployeeOnboarding.findOne({ onboardingRequestId });

  if (!onboarding) {
    throw new Error("Onboarding request not found");
  }

  if (onboarding.retryCount >= 5) {
    throw new Error("Retry limit reached");
  }

  return processOnboardingToSuccessFactors(onboardingRequestId);
}
export const createOnboardingRequest = async (
  payload
) => {

  const onboarding =
    await EmployeeOnboarding.create({

      onboardingRequestId:
        uuidv4(),

      employee:
        payload.employee,

      hr:
        payload.hr

    });

  return onboarding;
};

export const getAllRequests =
  async () => {

    return EmployeeOnboarding.find()
      .sort({
        createdAt: -1
      });

  };

export const getRequestById =
  async (id) => {

    return EmployeeOnboarding.findById(
      id
    );

  };

export const retryRequest =
  async (id) => {

    const onboarding =
      await EmployeeOnboarding.findById(
        id
      );

    if (!onboarding) {
      throw new Error(
        "Request not found"
      );
    }

    onboarding.retryCount += 1;

    onboarding.overallStatus =
      "in_progress";

    await onboarding.save();

    return onboarding;
  };