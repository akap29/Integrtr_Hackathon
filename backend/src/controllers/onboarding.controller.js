import {
  createOnboardingRequest,
  getAllRequests,
  getRequestById,
  retryRequest
}
from "../services/onboarding.service.js";

export const createOnboarding =
  async (
    req,
    res,
    next
  ) => {

    try {

      const onboarding =
        await createOnboardingRequest(
          req.body
        );

      res.status(201).json({
        success: true,
        data: onboarding
      });

    } catch (error) {
      next(error);
    }

  };

export const getAllOnboardings =
  async (
    req,
    res,
    next
  ) => {

    try {

      const data =
        await getAllRequests();

      res.json({
        success: true,
        data
      });

    } catch (error) {
      next(error);
    }

  };

export const getOnboardingById =
  async (
    req,
    res,
    next
  ) => {

    try {

      const data =
        await getRequestById(
          req.params.id
        );

      res.json({
        success: true,
        data
      });

    } catch (error) {
      next(error);
    }

  };

export const retryOnboarding =
  async (
    req,
    res,
    next
  ) => {

    try {

      const data =
        await retryRequest(
          req.params.id
        );

      res.json({
        success: true,
        data
      });

    } catch (error) {
      next(error);
    }

  };