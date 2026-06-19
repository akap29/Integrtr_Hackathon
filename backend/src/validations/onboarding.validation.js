import Joi from "joi";

export const createOnboardingSchema = Joi.object({
  employee: Joi.object({
    firstName: Joi.string().required(),

    lastName: Joi.string().required(),

    maritalStatus: Joi.string().valid(
      "single",
      "married",
      "divorced",
      "widowed"
    ),

    nationalId: Joi.string().required(),

    email: Joi.string()
      .email()
      .required(),

    dateOfBirth: Joi.date().required(),

    gender: Joi.string().valid(
      "male",
      "female",
      "other"
    ),

    nationality: Joi.string(),

    department: Joi.string(),

    jobTitle: Joi.string(),

    designation: Joi.string(),

    joiningDate: Joi.date()
  }).required(),

  hr: Joi.object({
    name: Joi.string().required(),

    email: Joi.string()
      .email()
      .required()
  }).required()
});