require("dotenv").config();

module.exports = {
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,

  EMPLOYEE_WEBHOOK_URL: process.env.EMPLOYEE_WEBHOOK_URL,
  HR_WEBHOOK_URL: process.env.HR_WEBHOOK_URL,

  TEAM_CHANNEL_ID: process.env.TEAM_CHANNEL_ID,
  HR_CHANNEL_ID: process.env.HR_CHANNEL_ID,

  SF_BASE_URL: process.env.SF_BASE_URL,
};