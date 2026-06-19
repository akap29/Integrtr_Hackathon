import mongoose from "mongoose";
import { processOnboardingToSuccessFactors } from "./services/onboarding.service.js";

const run = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/integrtr_hackathon");
    console.log("Connected to MongoDB");

    // Reset document
    const resetResult = await mongoose.connection.db.collection("employeeonboardings").updateOne(
      { _id: new mongoose.Types.ObjectId("6a3542ab17d89d622d7eb182") },
      {
        $set: {
          retryCount: 0,
          overallStatus: "pending",
          successFactors: {}, // clear to start fresh
          "steps.sf_write.status": "pending",
          "steps.sf_write.error": null,
          "steps.team_slack.status": "pending",
          "steps.team_slack.error": null,
          "steps.hr_slack.status": "pending",
          "steps.hr_slack.error": null,
        }
      }
    );
    console.log("Reset document:", resetResult);

    console.log("Calling processOnboardingToSuccessFactors for saksham singh...");
    const result = await processOnboardingToSuccessFactors("07ff0783-1346-411f-bf0d-c255adf3e1cb");
    console.log("Onboarding process succeeded! Result:", JSON.stringify(result.successFactors, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error("Onboarding failed with error:", err);
    // Also disconnect
    try {
      await mongoose.disconnect();
    } catch (_) {}
  }
};

run();
