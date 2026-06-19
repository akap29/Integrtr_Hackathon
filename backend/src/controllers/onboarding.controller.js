import EmployeeOnboarding from "../models/EmployeeOnboarding.js";
import {
  processOnboardingToSuccessFactors,
  retryOnboardingFlow,
} from "../services/onboarding.service.js";

export async function submitOnboarding(req, res) {
  try {
    const onboarding = await EmployeeOnboarding.create(req.body);
    const processed = await processOnboardingToSuccessFactors(
      onboarding.onboardingRequestId,
    );

    return res.status(201).json({
      success: true,
      data: processed,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function triggerOnboardingProcessing(req, res) {
  try {
    const { onboardingRequestId } = req.params;
    const processed =
      await processOnboardingToSuccessFactors(onboardingRequestId);

    return res.status(200).json({
      success: true,
      data: processed,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function retryOnboarding(req, res) {
  try {
    const { onboardingRequestId } = req.params;
    const processed = await retryOnboardingFlow(onboardingRequestId);

    return res.status(200).json({
      success: true,
      data: processed,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
