import express from "express";

import {
  createOnboarding,
  getAllOnboardings,
  getOnboardingById,
  retryOnboarding
} from "../controllers/onboarding.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import { createOnboardingSchema } from "../validations/onboarding.validation.js";

const router = express.Router();

router.post("/", validate(createOnboardingSchema), createOnboarding);

router.get("/", getAllOnboardings);

router.get("/:id", getOnboardingById);

router.post("/:id/retry", retryOnboarding);

export default router;
