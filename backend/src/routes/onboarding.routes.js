import express from "express";
import {
  submitOnboarding,
  triggerOnboardingProcessing,
  retryOnboarding,
} from "../controllers/onboarding.controller.js";

const router = express.Router();

router.post("/", submitOnboarding);
router.post("/process/:onboardingRequestId", triggerOnboardingProcessing);
router.post("/retry/:onboardingRequestId", retryOnboarding);

export default router;
