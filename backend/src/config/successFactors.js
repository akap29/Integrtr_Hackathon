
import dotenv from "dotenv";
dotenv.config();

export const SF_BASE_URL = process.env.SF_BASE_URL;
export const SF_COMPANY_ID = process.env.SF_COMPANY_ID;
export const SF_USERNAME = process.env.SF_USERNAME;
export const SF_PASSWORD = process.env.SF_PASSWORD;

export function getBasicAuthHeader() {
  const credential = Buffer.from(
    `${SF_USERNAME}@${SF_COMPANY_ID}:${SF_PASSWORD}`,
  ).toString("base64");

  return `Basic ${credential}`;
}