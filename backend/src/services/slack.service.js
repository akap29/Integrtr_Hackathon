import {
  SLACK_BOT_TOKEN,
  EMPLOYEE_WEBHOOK_URL,
  HR_WEBHOOK_URL,
  TEAM_CHANNEL_ID,
  SF_BASE_URL,
} from "../config/slack.js";
  
  function buildSuccessFactorsLink(employeeId) {
    return `${SF_BASE_URL}/sf/hrmd?selectedModule=Employee&userId=${encodeURIComponent(
      employeeId
    )}`;
  }
  
async function postToSlackAPI(payload) {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(`Slack API error: ${data.error || response.statusText}`);
  }

  return data;
}
  
  async function postToWebhook(webhookUrl, payload) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Slack Webhook error (${response.status}): ${text}`);
    }
  
    return true;
  }
  
  async function sendTeamWelcomeMessage(employee) {
    const {
      fullName,
      role,
      department,
      startDate,
      avatarUrl,
    } = employee;
  
    const payload = {
      channel: TEAM_CHANNEL_ID,
      text: `👋 Please welcome ${fullName} to the team!`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `👋 *Please welcome ${fullName} to the team!*`,
          },
          ...(avatarUrl && {
            accessory: {
              type: "image",
              image_url: avatarUrl,
              alt_text: fullName,
            },
          }),
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Role:*\n${role}` },
            { type: "mrkdwn", text: `*Department:*\n${department}` },
            { type: "mrkdwn", text: `*Start Date:*\n${startDate}` },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Let's give ${fullName.split(" ")[0]} a warm welcome! 🎉`,
            },
          ],
        },
        {
          type: "divider",
        },
      ],
    };
  
    return postToSlackAPI(payload);
  }
  
async function sendHrNotificationMessage(employee) {
    const {
      fullName,
      employeeId,
      role,
      department,
      startDate,
      email,
    } = employee;
  
    const sfLink = buildSuccessFactorsLink(employeeId);
  
    const payload = {
      text: `✅ New hire onboarded: ${fullName} (${employeeId})`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "✅ New Hire Onboarded",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${fullName}* has been successfully onboarded and their profile is active in SuccessFactors.`,
          },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Employee ID:*\n${employeeId}` },
            { type: "mrkdwn", text: `*Email:*\n${email}` },
            { type: "mrkdwn", text: `*Role:*\n${role}` },
            { type: "mrkdwn", text: `*Department:*\n${department}` },
            { type: "mrkdwn", text: `*Start Date:*\n${startDate}` },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View in SuccessFactors 🔗",
                emoji: true,
              },
              style: "primary",
              url: sfLink,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Onboarding completed · <${sfLink}|Direct record link>`,
            },
          ],
        },
      ],
    };
  
  return postToWebhook(HR_WEBHOOK_URL, payload);
}
  
async function sendOnboardingNotifications(employeeData) {
  const [teamMessage, hrNotification] = await Promise.all([
    sendTeamWelcomeMessage(employeeData),
    sendHrNotificationMessage(employeeData),
  ]);

  return {
    teamMessage,
    hrNotification,
  };
}

export { sendOnboardingNotifications, sendTeamWelcomeMessage, sendHrNotificationMessage };