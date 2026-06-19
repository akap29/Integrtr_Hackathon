import dotenv from "dotenv";

dotenv.config();

export const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
export const EMPLOYEE_WEBHOOK_URL = process.env.EMPLOYEE_WEBHOOK_URL;
export const HR_WEBHOOK_URL = process.env.HR_WEBHOOK_URL;
export const TEAM_CHANNEL_ID = process.env.TEAM_CHANNEL_ID;
export const HR_CHANNEL_ID = process.env.HR_CHANNEL_ID;
export const SF_BASE_URL = process.env.SF_BASE_URL;